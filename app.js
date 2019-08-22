const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const indexRouter = require('./routes/index');
const errorMiddleware = require('./middlewares/errors');

mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DB}?authSource=admin`, {
  useNewUrlParser: true,
  user: process.env.MONGODB_USER,
  pass: process.env.MONGODB_PASS
})
.then(() => {
  console.log('MongoDB Connected')
})
.catch((e) => {
  console.log(e)
});

var app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.use(errorMiddleware);

module.exports = app;