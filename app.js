var express = require('express');
var app = express();
var mongoose = require('mongoose');
var TweetController = require('./tweets/TweetController');
var AuthController = require('./auth/AuthController');
var UserController = require('./user/UserController');

// making the connection with the mongodb database
mongoose.connect("mongodb://admin:14768925@127.0.0.1:27017/tweeter?authSource=admin", { autoIndex: false })

app.use('/tweet', TweetController);
app.use('/user', UserController);
app.use('/auth', AuthController);

module.exports = app;