const express = require('express');
const tourRouter = require('./routers/tourRouter');
const app = express();


app.use('/api/v1/tour', tourRouter)


module.exports = app;