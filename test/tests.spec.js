var mongoose = require('mongoose');
var Tweet = require('../tweets/tweet');
var User = require('../user/User');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();


var token, retoken;
chai.use(chaiHttp);

describe('User', ()=> {
    var id1, id2;
    // clear the database before starting the test
    User.remove({}, (err)=> console.log(err));

    describe('/post register', () => {
        var user = {
            username: "barshan",
            password: "123456"
        }
        it('should register a user', (done) => {
            chai.request(server)
                .post('/user/register')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.a('object');
                    res.body.should.have.property('message').eql("Successfully registered");
                    res.body.should.have.property('access_token');
                    res.body.should.have.property('refresh_token');
                    token = res.body.access_token;
                    id1 = res.body.id;
                    done();
                });
        });
    });
    describe('/post register', () => {
        var user = {
            username: "barshan22",
            password: "123456"
        }
        it('should register a user', (done) => {
            chai.request(server)
                .post('/user/register')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.a('object');
                    res.body.should.have.property('message').eql("Successfully registered");
                    res.body.should.have.property('access_token');
                    res.body.should.have.property('refresh_token');
                    id2 = res.body.id;
                    done();
                });
        });
    });

    describe('/post follow', () => {
        it('should follow a user', (done) => {
            chai.request(server)
                .post('/user/follow/'+id2)
                .set('authorization', 'Bearer '+token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.a('object');
                    res.body.should.have.property('message').eql("Successfully followed!");
                    done();
                });
        });
    });

    describe('/post unfollow', () => {
        it('should unfollow a user', (done) => {
            chai.request(server)
                .delete('/user/unfollow/'+id2)
                .set('authorization', 'Bearer '+token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.a('object');
                    res.body.should.have.property('message').eql("Successfully unfollowed!");
                    done();
                });
        });
    });


});


describe('Tweet', () => {
    Tweet.remove({}, (err) => {
    })
    //this will store the id of the created tweet
    var id;

    chai.request(server)
        .post('/auth/login')
        .send({})

    // test the get routes
    describe('/GET Tweets', () => {
        it('should get all the tweets', (done) => {
            chai.request(server)
                .get('/tweet/')
                .set('authorization', 'Bearer '+token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.a('object');
                    res.body.length.should.be.eql(0);
                    done();
                });
        });
    });

    // test the post route
    describe('/POST tweet', () => {
        it("should create a tweet", (done) => {
            var tweet = {
                tweet: "this is a tweet"
            }
            chai.request(server)
                .post('/tweet/')
                .set('authorization', 'Bearer '+token)
                .send(tweet)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('message').eql('Successfully added the tweet');
                    res.body.should.have.property('id');
                    id = res.body.id;
                    done();
                });
        });
    });
    // test the get individual tweet route
    describe('/GET tweet/:id', () => {
        it("should return a tweet", (done) => {
            chai.request(server)
                .get('/tweet/'+id)
                .set('authorization', 'Bearer '+token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('_id').eql(id);
                    res.body.should.have.property('tweet').eql("this is a tweet");
                    done();
                });
        });
    });

    // test the delete tweet route
    describe('/DELETE tweet/:id', () => {
        it("should delete a tweet", (done) => {
            chai.request(server)
                .delete('/tweet/'+id)
                .set('authorization', 'Bearer '+token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('id').eql(id);
                    res.body.should.have.property('message').eql("Tweet deleted");
                    done();
                });
        });
    });
});

describe('Auth', () => {
    describe('/post login', () => {
        it('should login successfully', (done) => {
            chai.request(server)
                .post('/auth/login')
                .send({username: 'barshan', password: '123456'})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.a('object');
                    res.body.should.have.property('access_token');
                    res.body.should.have.property('refresh_token');
                    retoken = res.body.refresh_token;
                    console.log(retoken);
                    done();
                });
        });
    });

    describe('/get refresh token', () => {
        it('should send a new access token', (done) => {
            chai.request(server)
                .get('/auth/token/refresh')
                .set('x-refreshToken', retoken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.a('object');
                    res.body.should.have.property('messsage').eql('Success');
                    res.body.should.have.property('access_token');
                    done();
                });
        });
    });
});