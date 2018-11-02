var express = require('express');
var router = express.Router();
var bp = require('body-parser');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
// secret key to be used for encrypting the jwt payload
var secret = process.env.SECRET || 's3cr3t';

var User = require('../user/User');

router.use(bp.urlencoded({extended: true}));
router.use(bp.json());

var checkBody = function(req, res, next){
    // middleware to check if req body contains right amount of data
    if (req.body.constructor === Object && Object.keys(req.body).length !== 0 && req.path === '/login' && req.body.hasOwnProperty('username') && req.body.hasOwnProperty('password')){
        // only the login route needs username and password in this router
        return next();
    }
    if(req.method === 'GET'){
        return next();
    }
    return res.status(402).send({message: "Not enough data!"});
}
// use the body checking middleware
router.use(checkBody);

router.post('/login', (req, res) =>{
    
    User.findOne({username : req.body.username}, function(err, user){
        if (err){
            // console.log(err);
            return res.status(500).send("There was a problem!");
        }
        console.log(user);
        if (user && bcrypt.compareSync(req.body.password, user.password)){
            // console.log(user.password);
            var access_token = jwt.sign({id: user._id, type: "access"}, secret, {
                expiresIn: 86400 // 24 hours
            });
            var refresh_token = jwt.sign({id: user._id, type: "refresh"}, secret, {
                expiresIn: 604800 // 7 days        
            })
            return res.status(200).send({message: "Success", access_token: access_token, refresh_token: refresh_token});
        }
        return res.status(401).send({message: "Invalid credentials!"});
    });
});


// route to get new accesstoken using a refresh token
router.get('/token/refresh', (req, res) =>{
    var token = req.headers['x-refreshtoken'];
    console.log(req.headers);
    if (!token) return res.status(401).send({message : "refresh token not found!"})
    try {
        var decoded = jwt.verify(token, secret);
        if (decoded['type'] == 'refresh'){
            var id = decoded['id'];
            var access_token = jwt.sign({id: id, type: "access"}, secret, {
                expiresIn: 86400 // 24 hours
            });
            return res.send({messsage: "Success", access_token: access_token});
        }
        return res.send(401).send({message: "Wrong token!"});
    } catch (error) {
        console.log(error);
        return res.send(401).send({message: "Invalid token!"});
    }
});



module.exports = router;