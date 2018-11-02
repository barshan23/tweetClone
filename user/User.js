var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');


var UserSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    password: {type: String},
    followers:[{type: mongoose.Schema.ObjectId, ref : 'User'}],
    following: [{type: mongoose.Schema.ObjectId, ref: 'User'}]
});
UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});
mongoose.model('User', UserSchema);
module.exports = mongoose.model('User');