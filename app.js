const express = require('express');

const dotenv = require('dotenv');

const morgan = require('morgan');

dotenv.config({path:'./config.env'});

const mongoose = require('mongoose');

const tourRouter = require('./routers/tourRouter');

const app = express();

app.use(morgan('development'))

app.use(express.json());



console.log("DB connection ====> "+process.env.DB_CONNECTION_LOCAL);

mongoose.connect(process.env.DB_CONNECTION_LOCAL, {
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology: true
}).then( () => console.log('database connection successful'))

app.use('/api/v1/tour', tourRouter)


module.exports = app;