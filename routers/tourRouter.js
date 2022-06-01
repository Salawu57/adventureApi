const express = require('express');

const tourController = require('../controller/tourController')

const tourRouter = express.Router();

tourRouter.route("/topRatingTour").get(tourController.aliasTopTour, tourController.getAllTour);
tourRouter.route('/tour-stats').get(tourController.getTourStats);
tourRouter.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
tourRouter.route("/").get(tourController.getAllTour).post(tourController.createTour);
tourRouter.route("/:id").get(tourController.getTour).patch(tourController.updateTour).delete(tourController.deleteTour);

module.exports = tourRouter;


