const express = require("express");
const reviewController = require("./../controller/reviewController");
const authController = require("./../controller/authController");

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(authController.protect);
reviewRouter
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo("user"),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

reviewRouter
  .route("/:id")
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo("user", "admin"),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo("user", "admin"),
    reviewController.deleteOne
  );

module.exports = reviewRouter;
