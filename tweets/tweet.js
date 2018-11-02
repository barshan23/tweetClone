var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TweetSchema = new Schema({
    tweet: String,
    author: String,
    created_at: Date,
    updated_at: Date,
});

mongoose.model('Tweet', TweetSchema);

module.exports = mongoose.model('Tweet');