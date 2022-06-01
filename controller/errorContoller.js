const AppError = require("../utils/appError");

const handleCastErrorDB = err => {

  const message =`Invalid ${err.path}: ${err.value}.`

  return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err =>{
 
 const {keyValue} = {...err};

 console.log("message ====>", err);

  const message = `Duplicate field value: ${keyValue.name}. Please use another value.`;

  return new AppError(message, 400);
}

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  //Operational , trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // log error to console
    console.error(`ERROR 🔥`, err.name);

    //send generic message
    res.status(500).json({
      status: "error",
      message: "Something went very wrong",
    });
  }
};


module.exports = (err, req, res, next) => {
   console.log(err)
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    
    sendErrorDev(err, res);

  } else if (process.env.NODE_ENV === "production") {

    let copyError = { ...err };

    console.log(copyError);

      if(copyError.name === 'CastError'){
       
        copyError =  handleCastErrorDB(copyError)

      }else if(copyError.code === 11000){

        copyError = handleDuplicateFieldsDB(copyError)

      }

    sendErrorProd(copyError, res);
  }
};
