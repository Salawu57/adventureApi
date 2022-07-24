const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const morgan = require("morgan");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorContoller");

dotenv.config({ path: "./config.env" });

const mongoose = require("mongoose");

const tourRouter = require("./routers/tourRouter");
const userRouter = require("./routers/userRouter");
const reviewRouter = require("./routers/reviewRouter");
const bookingRouter = require("./routers/bookingRouter");
const viewRouter = require("./routers/viewRoute");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

//Set Security HTTP header
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: {
      allowOrigins: ['*']
  },
  contentSecurityPolicy: {
      directives: {
          defaultSrc: ['*'],
          scriptSrc: ["* data: 'unsafe-eval' 'unsafe-inline' blob:"]
      }
  }
}));

//Development Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Limit request from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, //milliseconds
  message: "Too many requests for this IP, please try again in an hour",
});

app.use("/api", limiter);

// Body Parser reading data from the body in req.body
app.use(express.json({ limit: "10kb" }));
//Get form data
app.use(express.urlencoded({extended:true, limit: '10kb'}));

//Parse data from the cookies
app.use(cookieParser());

//Data sanitization
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

app.use(compression());

//sanitizing data against no-sql injection
app.use(mongoSanitize());

app.use((req,res,next) => {

  req.requestTime = new Date().toISOString();

  next();
})


app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

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
