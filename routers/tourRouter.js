const express = require('express');

const tourController = require('../controller/tourController')

const tourRouter = express.Router();

tourRouter.route("/").get(tourController.getAllTour).post(tourController.createTour);
tourRouter.route("/:id").get(tourController.getTour).patch(tourController.updateTour).delete(tourController.deleteTour);

module.exports = tourRouter;


