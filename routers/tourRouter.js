const express = require('express');

const tourController = require('../controller/tourController')

const tourRouter = express.Router();

tourRouter.route("/").get(tourController.getAllTour);

module.exports = tourRouter;


