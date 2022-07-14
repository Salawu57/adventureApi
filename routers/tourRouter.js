const express = require("express");

const tourController = require("../controller/tourController");
const authController = require("./../controller/authController");
const reviewRouter = require("./../routers/reviewRouter");

const tourRouter = express.Router();

// tourRouter
//   .route("/:tourId/reviews")
//   .post(
//     authController.protect,
//     authController.restrictTo("user"),
//     reviewController.createReview
//   );

// Mounting a reviewRouter in tourRouter
tourRouter.use("/:tourId/reviews", reviewRouter);

tourRouter
  .route("/topRatingTour")
  .get(tourController.aliasTopTour, tourController.getAllTour);
tourRouter.route("/tour-stats").get(tourController.getTourStats);
tourRouter
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    tourController.getMonthlyPlan
  );
tourRouter
  .route("/")
  .get(tourController.getAllTour)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.createTour
  );

tourRouter.route("/tours-within/:distance/center/:latlng/unit/:unit").get(tourController.getToursWithin);
tourRouter.route("/distances/:latlng/unit/:unit").get(tourController.getDistance);
tourRouter
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

module.exports = tourRouter;
