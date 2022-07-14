const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;

  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const { keyValue } = { ...err };

  const message = `Duplicate field value: ${keyValue.name}. Please use another value.`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const checkErrors = Object.values(err.errors);

  const message = `Invalid input data. ${errors.join(". ")}`;

  return new AppError(message, 400);
};

const handleJWTError = (err) =>
  new AppError("Invalid token. Please login again", 401);

const handleJWTExpiredError = (err) =>
  new AppError("Your token has expired! Please login again", 401);

const sendErrorDev = (err,req,res) => {
  //API
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } 
    // RENDERING PAGE
     // log error to console
     console.error(`ERROR 🔥`, err);

    return res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
};

const sendErrorProd = (err,req, res) => {

  //API
  if(req.originalUrl.startsWith('/api')){
 
    //Operational , trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } 
    // log error to console
    console.error(`ERROR 🔥`, err.name);

    //send generic message
    return res.status(500).json({
      status: "error",
      message: "Something went very wrong",
    });
  }
  
  //RENDERING PAGE
    //Operational , trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
  } 
    // log error to console
    console.error(`ERROR 🔥`, err.name);

    //send generic message
   return  res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: 'Please try again later',
    });
};

module.exports = (err, req, res, next) => {
  console.log(err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let copyError = { ...err };
     copyError.message = err.message;

    if (err.name === "CastError") {
      copyError = handleCastErrorDB(err);
    } else if (copyError.code === 11000) {
      copyError = handleDuplicateFieldsDB(copyError);
    } else if (err.name === "ValidationError") {
      copyError = handleValidationErrorDB(err);
    } else if (err.name === "JsonWebTokenError") {
      copyError = handleJWTError(err);
    } else if (err.name === "TokenExpiredError") {
      copyError = handleJWTExpiredError(err);
    }

    sendErrorProd(copyError, req, res);
  }
};
