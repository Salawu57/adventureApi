const express = require("express");

const dotenv = require("dotenv");

const morgan = require("morgan");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorContoller");

dotenv.config({ path: "./config.env" });

const mongoose = require("mongoose");

const tourRouter = require("./routers/tourRouter");

const app = express();

app.use(morgan("development"));

app.use(express.json());

mongoose
  .connect(process.env.DB_CONNECTION_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("database connection successful"));



app.use("/api/v1/tour", tourRouter);


// app.all("*", (req, res, next) => {

   
//      res.status(404).json({
//          status:'fail',
//          message:`Can't find ${req.originalUrl} on this server`
//      });
   
// });


// app.all("*", (req, res, next) => {

//      const err = new Error(`Can't find ${req.originalUrl} on this server`);
//      err.status = "fail";
//      err.statusCode = 400;
   
 //     next(err);
//  });

// app.use((err, req, res, next) => {
//     console.log(err.stack)
//     err.statusCode = err.statusCode || 500;
//     err.status = err.status || "error";
  
//     res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message,
//     });
//   });

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

//error handling middleware
app.use(globalErrorHandler);

module.exports = app;
