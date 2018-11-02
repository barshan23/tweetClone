var app = require('./app');

var port = process.env.PORT || 3000;

var server = app.listen(port, () => {
    console.log("Server started at: "+port);
});

module.exports = server;