/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
*/

require('dotenv').config();
process.env.SECRET_KEY;

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
db = require('./db')(); //hack
var jwt = require('jsonwebtoken');
var cors = require('cors');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        env: process.env.SECRET_KEY,  // Changed from 'key' to 'env'
        body: "No body",
        query: {}
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    if (req.query != null) {
        json.query = req.query;
    }

    return json;
}

router.get('/', (req, res) => {
    res.send('API is live!');
});

// Signup route
router.post('/signup', (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'});
    } else {
        var newUser = {
            username: req.body.username,
            password: req.body.password
        };

        db.save(newUser); //no duplicate checking
        res.json({success: true, msg: 'Successfully created new user. ^.^'});
    }
});

// Signin route
router.post('/signin', (req, res) => {
    var user = db.findOne(req.body.username);

    if (!user) {
        res.status(401).send({success: false, msg: 'Authentication failed. User not found. T.T'});
    } else {
        if (req.body.password == user.password) {
            var userToken = { id: user.id, username: user.username };
            var token = jwt.sign(userToken, process.env.SECRET_KEY);
            res.json({success: true, token: 'JWT ' + token});
        } else {
            res.status(401).send({success: false, msg: 'Authentication failed. T.T'});
        }
    }
});

// /movies route
router.route('/movies')
    .get((req, res) => {
        var o = {
            status: 200,
            message: "GET movies",
            headers: req.headers,
            query: req.query,
            env: process.env.SECRET_KEY
        };
        res.json(o);
    })
    .post((req, res) => {
        var o = {
            status: 200,
            message: "movie saved",
            headers: req.headers,
            query: req.query,
            env: process.env.SECRET_KEY
        };
        res.json(o);
    })
    .put(authJwtController.isAuthenticated, (req, res) => {
        var o = {
            status: 200,
            message: "movie updated",
            headers: req.headers,
            query: req.query,
            env: process.env.SECRET_KEY
        };
        res.json(o);
    })
    .delete(authController.isAuthenticated, (req, res) => {
        var o = {
            status: 200,
            message: "movie deleted",
            headers: req.headers,
            query: req.query,
            env: process.env.SECRET_KEY
        };
        res.json(o);
    })
    .all((req, res) => {
        res.status(405).send({ message: 'HTTP method not supported.' });
    });

// Optional testcollection route
router.route('/testcollection')
    .delete(authController.isAuthenticated, (req, res) => {
        var o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "testcollection deleted";
        res.json(o);
    })
    .put(authJwtController.isAuthenticated, (req, res) => {
        var o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "testcollection updated";
        res.json(o);
    });

app.use('/', router);

app.listen(process.env.PORT || 8080, () => {
    console.log("Server running on port " + (process.env.PORT || 8080));
});

module.exports = app; // for testing only