var express = require('express');
var db = require('../models');
var router = express.Router();

// main page, lists upcoming tournaments
router.get('/',function(req,res) {
    res.render('main/index');
});

// listing of pros with sorting and filtering options
router.get('/pros',function(req,res) {
    res.send("pro rankings");
});

// view a specific tournament's details and roster
router.get('/:tournament',function(req,res) {
    res.send(req.params)
});

// view a specific player's profile and stats
router.get('/pros/:player',function(req,res) {
    res.send(req.params);
});

// view a specific league you are apart of
router.get('/league/:leagueid',function(req,res) {
    res.send(req.params);
});

// view a specific team you own
router.get('/team/:teamid',function(req,res) {
    res.send(req.params);
});

module.exports = router;