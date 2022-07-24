const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
// const sendEmail = require("../utils/email");
const Email = require("../utils/emailAd");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode,req, res) => {
  const token = signToken(user._id);

  // if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),

    httpOnly: true,
    
    //Test if connection is secure
    secure: req.secure || req.headers('x-forwarded-proto') === 'https'

  });

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    //role: req.body.role,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;

  console.log(url);

  await new Email(newUser,url).sendWelcome();

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1 check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 404));
  }
  //2 check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");

  console.log(user);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  //3 if everything ok, send token to client
  createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  console.log("header ============>", req.headers.authorization);
  //1 get token and check if its exist
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError("You are not logged in! Please login to get access", 401)
    );
  }
  //2 validate the token
  const decoder = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3 check if user stil exists
  const freshUser = await User.findById(decoder.id);

  if (!freshUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  //4 check if user change password after the jwt token was ussue
  if (freshUser.changedPasswordAfter(decoder.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE ====> give acces to the user for the next middleware
  req.user = freshUser;
  res.locals.user = freshUser

  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    //verify token from cookies
    try {
      const decoder = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //3 check if user stil exists
      const currentUser = await User.findById(decoder.id);

      if (!currentUser) {
        return next();
      }

      //4 check if user change password after the jwt token was ussue
      if (currentUser.changedPasswordAfter(decoder.iat)) {
        return next();
      }

      //There is a login user
      //pass user to the template view(locals.user)  on the response
      res.locals.user = currentUser;

      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //req.user comes from the protect middleware
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get user with email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  //generate the random token
  const resetToken = user.createPasswordResetToken();

  //save token after calling the createPasswordResetToken  and also set validation to false
  await user.save({ validateBeforeSave: false });

  // const message = `Forget your password? Submit a PATCH request with your new password and passwordConfirm to : ${resetURL}.\n if you didn't forget your pasword, please ignore this email!`;

  try {
    //previous implementation 
    // await sendEmail({
    //   email: user.email,

    //   subject: "Your password reset token (valid for 10 min)",

    //   message,
    // });

      //send it through email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/resetPassword/${resetToken}`;



    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",

      message: "Token sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefine;
    user.passwordResetExpires = undefine;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1 getuser based on the token
  const hashToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2 if token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  //3 update changedPasswordAt property for the user

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  //4 Log the user in, send jwt
  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get the user from the collection
  const user = await User.findById(req.user.id).select("+password");

  // check if password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  //if so, then update
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  // send jwt to the user
  createSendToken(user, 200, req, res);
});
