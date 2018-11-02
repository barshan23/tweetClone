var express = require('express');
var bp = require('body-parser');
var jwt = require('jsonwebtoken');
var router = express.Router();
var secret = 's3cr3t';

var Tweet = require('./tweet');

var token_required = function(req, res, next){
    // console.log(req.headers);
    var token = req.headers['authorization'];
    if (!token) return res.status(401).send({message:"No token!"})
    try {
        token = token.split(" ")[1];
        // console.log(token);
        var id = jwt.verify(token, secret);
        req.user_id = id.id;
    } catch (error) {
        // console.log(error);
        return res.status(401).send({"message":"Invalid token!"});
    }
    next();
}

router.use(bp.json());
router.use(bp.urlencoded({extended: true}));
router.use(token_required);

var checkBody = function(req, res, next){
    // middleware to check if req body contains right amount of data
    if (req.path === '/' && req.method === 'POST' && req.body.constructor === Object && Object.keys(req.body).length !== 0 && req.body.hasOwnProperty('tweet')){
        // only the login route needs username and password in this router
        return next();
    }
    if(req.method === 'GET' || req.method === 'DELETE'){
        return next();
    }
    return res.status(206).send({message: "Not enough data!"});
}
// use the body checking middleware
router.use(checkBody);


router.post('/',function(req, res){
    // create a tweet
    Tweet.create({
        tweet: req.body.tweet,
        author: req.user_id, // this user_id is extracted from the token provided
        comments: [],
        created_at: new Date(Date.now()),
        updated_at: new Date(Date.now()),
        meta: {like: 0, unlike: 0}
    }, function(err, tweet){
        if (err) return res.status(500).send("problem inserting the tweet!");
        console.log(tweet);
        return res.send({message: "Successfully added the tweet", id: tweet._id})
    });
});

router.delete('/:id',(req, res)=>{
    // delete the tweet having the given id
    Tweet.find({_id: req.params.id, author: req.user_id}).remove((err, tweet)=>{
        if (err) return res.status(500).send({message: "problem getting the tweet!"});
        res.send({message: "Tweet deleted", id: req.params.id});
    });
});

router.get('/:id', (req, res)=>{
    // show the tweet having the given id
    Tweet.findById(req.params.id, (err, tweet)=>{
        if (err) return res.status(500).send("problem getting the tweet!");
        if(!tweet) return res.status(404).send("Tweet not found!");
        res.send(tweet);
    });
});

router.get('/', (req, res)=>{
    // show all the tweets
    Tweet.find({}, (err, tweet)=>{
        console.log(tweet);
        if (err) return res.status(500).send("problem getting the tweet!");
        if(!tweet) return res.status(404).send("Tweet not found!");
        res.send(tweet);
    });
});

module.exports = router;