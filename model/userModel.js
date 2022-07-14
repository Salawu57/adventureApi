const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],

    //This only works on create and save!!!!
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Password are not the same",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//encrypting the password before saving to the database
userSchema.pre("save", async function (next) {
  //only run this  function if the password was actually modified
  if (!this.isModified("password")) return next();

  //Hash the password with cost of 12 (12 determine how long the encryption takes)
  this.password = await bcrypt.hash(this.password, 12);

  //remove passwordConfirm field
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  //NB some time saving to the database might be a bit slower than issuing a web token making the passwordchange timestamp to be set after the web token has been created (user might not be able to login with the token)
  this.passwordChangedAt = Date.now() - 1000;

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changeTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changeTimestamp, JWTTimestamp);
    return JWTTimestamp < changeTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  console.log({ resetToken }, this.passwordResetToken);

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
