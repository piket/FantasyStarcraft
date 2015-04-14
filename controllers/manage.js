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
    console.log("/manage/pros/ called");
    var playersURL ="http://aligulac.com/api/v1/player/set/"+req.params.player+"?apikey="+process.env.ALIGULAC_KEY
    var url = "http://aligulac.com/api/v1/match?apikey="+process.env.ALIGULAC_KEY+"&eventobj__uplink__parent=41322&limit=0"
    request(url,function(error,response,data) {
        if(!error && response.statusCode == 200) {
            var matches = JSON.parse(data).objects
            console.log("Pulling data:",players)
            // res.send(matches);
            var details = [];
            for (var i = 0; i < matches.length; i++) {
                if (players.indexOf(matches[i].pla.id.toString()) !== -1 || players.indexOf(matches[i].plb.id.toString()) !== -1) {
                details.push({
                    playerA: matches[i].pla.tag,
                    playerB: matches[i].plb.tag,
                    idA: matches[i].pla.id,
                    idB: matches[i].plb.id,
                    score: [matches[i].sca,matches[i].scb],
                    matchup: matches[i].rca +"v" + matches[i].rcb
                });
                }
            }

            var scores = {};
            players.forEach(function(player) {
                var id = parseInt(player);
                var tally = details.reduce(function(prev,current){
                    if(current.idA === id) {
                        var p = current.score[0];
                        var o = current.score[1];
                   }
                    else if (current.idB === id) {
                        var p = current.score[1];
                        var o = current.score[0];
                    }
                    else {
                        return prev + 0;
                    }

                    switch(true) {
                        case (p+o) <= 5 && (p+o) >= 3:
                            if(o === 0) {
                                return prev + (p*2) + 1;
                            }
                            return prev + (p*2) - o;
                        case (p+o) <=7 && (p+o) >= 4:
                            if(o === 0) {
                                return prev + (p*2) + 2;
                            }
                            return prev + (p*2) - o;
                        case (p+o) <= 11 && (p+o) >= 5:
                            if (o === 0) {
                                return prev + (p*2) + 3;
                            }
                            return prev + (p*2) - o;
                        case (p+o) > 11:
                            if (o === 0) {
                                return prev + (p*2) + 3;
                            }
                            return prev + (p*2) - o;
                        default:
                            return prev + (p*2) - o;
                    }
                },0);
                scores[id] = {points:tally};
            });

            request(playersURL,function(error,response,playerData) {
                if(!error && response.statusCode == 200) {
                    console.log("Pulling name data");
                    JSON.parse(playerData).objects.forEach(function(player) {
                        scores[player.id].name = player.tag;
                    })
                    res.send({matches:details,scores:scores});
                }
            })
        }
        else {
            console.log("Error:",error);
            res.send("Error: "+error)
        }
    });
});

module.exports = router;