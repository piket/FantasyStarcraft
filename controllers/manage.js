var express = require('express');
var db = require('../models');
var router = express.Router();
var request = require('request');

router.post('/create/team',function(req,res) {
    // db call to create your team
    var players = [req.body.slot1,req.body.slot2,req.body.slot3,req.body.slot4,req.body.slot5,req.body.slot6];
    db.team.findOrCreate({where: {name:req.body.name,userId:req.session.user.id}, defaults: {name:req.body.name,players:players}})
        .spread(function(team,created) {
            if(created) {
                db.user.find(req.session.user.id).then(function(user) {
                    user.addTeam(team);
                    res.redirect('/auth/account');
                })
            }
        })
    // res.send(req.body);
});

router.get('/pros/:player', function(req,res) {
    var players = req.params.player.split(';');
    // var url ="http://aligulac.com/api/v1/player/set/"+req.params.player+"?apikey="+process.env.ALIGULAC_KEY
    var url = "http://aligulac.com/api/v1/match?apikey="+process.env.ALIGULAC_KEY+"&eventobj__uplink__parent=41322&limit=0"
    request(url,function(error,response,data) {
        if(!error && response.statusCode == 200) {
            var matches = JSON.parse(data).objects
            console.log(players)
            // res.send(matches);
            var details = [];
            for (var i = 0; i < matches.length; i++) {
                if (players.indexOf(matches[i].pla.id.toString()) !== -1 || players.indexOf(matches[i].plb.id.toString()) !== -1) {
                details.push({
                    playerA: matches[i].pla.id,
                    playerB: matches[i].plb.id,
                    score: [matches[i].sca,matches[i].scb],
                    matchup: matches[i].rca +"v" + matches[i].rcb
                });
                }
            }

            res.send({matches:details});
        }
        else {
            console.log("Error:",error);
            res.send("Error: "+error)
        }
    });
});

module.exports = router;