var express = require('express');
var router = express.Router();
var bp = require('body-parser');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var secret = process.env.SECRET || 's3cr3t';

var User = require('../user/User');

var token_required = function(req, res, next){
    console.log(req.path);
    if (req.path == '/register') return next(); // don't need a token for registration
    // otherwise check for the authencity of token
    var token = req.headers['authorization'];
    if (!token) return res.status(401).send({message:"No token!"})
    try {
        // token is of the form "Bearer token_value"
        token = token.split(" ")[1];
        // console.log(token);
        var id = jwt.verify(token, secret);
        // console.log(id.id);
        req.user_id = id.id; 
    } catch (error) {
        console.log(error);
        return res.status(401).send({message:"Invalid token!"});
    }
    next();
}


router.use(bp.urlencoded({extended: true}));
router.use(bp.json());
router.use(token_required);

var checkBody = function(req, res, next){
    // middleware to check if req body contains right amount of data

    if (req.path === '/register' && req.body.constructor === Object && Object.keys(req.body).length !== 0 && req.body.hasOwnProperty('username') && req.body.hasOwnProperty('password') && req.body.password.length >= 6){
        // only the login route needs username and password in this router
        return next();
    }else if (req.path.includes('/follow') || req.path.includes('/unfollow')){
        // for following and unfollowing there is no body to be sent
        return next();
    }
    return res.status(206).send({message: "Not enough data!"});
}
// use the body checking middleware
router.use(checkBody);



router.post('/register', (req, res) => {
    // hash the password
    var hash = bcrypt.hashSync(req.body.password, 8);
    // create the user
    User.create({
        username: req.body.username,
        password: hash,
        followers: [], // has no followers
        following: [] // not following anyone
    }, function(err, user){
        console.log(user);
        if (err) return res.status(500).send({message: "There was a problem!"});
        var access_token = jwt.sign({id: user._id, type: "access"}, secret, {
            // access token has expiry of 24hours
            expiresIn: 86400 // 24 hours
        });
        var refresh_token = jwt.sign({id: user._id, type: "refresh"}, secret, {
            // refresh token has expiry of 7 days
            expiresIn: 604800 // 7 days        
        });
        return res.status(200).send({id: user._id, message: "Successfully registered", access_token: access_token, refresh_token: refresh_token});
    });
});

router.post('/follow/:id', (req, res) => {
    // this route is used to follow a user
    var id = req.params.id; // id of the user to be followed
    if(id === req.user_id) return res.status(401).send({message: "Can't follow yourself!"});
    User.findOne({_id: id ,followers: req.user_id}, (err, user)=> {
        // checking if the user already is being followed by the loggedin user
        console.log(user);
        if (user) return res.send("Already following!");
        else{
            // else put the id of the loggedin user inside the followers array of the followed user
            User.findByIdAndUpdate(id, {$push: {followers: req.user_id}}, (err, user) => {
                if (err) return res.status(500).send({message: "problem following!"});
                if (!user) return res.status(404).send({message: "User not found!"});
                console.log(user);
                // put the id of the followed user to the following array of the loggedin user
                User.findByIdAndUpdate(req.user_id, {$push: {following: id}}, (err, user) => {
                    if (err) return res.status(500).send({message: "problem following!"});
                    console.log(user);
                    return res.send({message: "Successfully followed!"});
                });
            });
            
        }
    });
});

router.delete('/unfollow/:id', (req, res) => {
    // this route is used to unfollow a user
    var id = req.params.id; // id of the user to be unfollowed

    User.findByIdAndUpdate(id, {$pull: {followers: req.user_id}}, (err, user) => {
        // remove the id of the loggedin user from the followers array of the unfollowed user
        if (err) return res.status(500).send({message: "problem unfollowing!"});
        if (!user) return res.status(404).send({message: "User not found!"});
        console.log(user);
        User.findByIdAndUpdate(req.user_id, {$pull: {following: id}}, (err, user) => {
            // remove the id of the unfollowed user from the following array of the loggedin user
            if (err) return res.status(500).send({message: "problem unfollowing!"});
            console.log(user);
            return res.send({message: "Successfully unfollowed!"});
        });
    });
});
module.exports = router;