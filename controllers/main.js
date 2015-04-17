var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var db = require('../models');
var async = require('async');
var router = express.Router();

// main page, lists upcoming tournaments
router.get('/',function(req,res) {
        db.tournament.findAll({order: '"startDate" ASC'}).then(function(tourneys) {
            // res.send(tourneys);
            // console.log(tourneys.length)
            res.render('main/index',{events:tourneys});
        });
});


// view a specific tournament's details and roster
router.get('/tournament/:tournament',function(req,res) {
    console.log(req.params.tournament)

    var name = req.params.tournament.replace(/_/g,' ')

    db.tournament.find({where: {name:{ilike:name}}, include: [{model:db.league,include: [db.user,db.team]}]}).then(function(tourney) {

            if(req.session.user) {
            var userLeagues = tourney.leagues.filter(function(league) {
                for(var i = 0; i < league.users.length; i++) {
                    if(league.users[i].id === req.session.user.id) {
                        return true;
                    }
                };
                return false;
                });
            }
            else {
                var userLeagues = [];
            }

            res.render('main/tournament',{param:req.params.tournament,name:tourney.name,start:tourney.startDate,end:tourney.endDate,id:tourney.id,leagues:userLeagues});
    });
});

router.get('/pull/:tournament',function(req,res) {
    console.log(req.params.tournament)

    var name = req.params.tournament.replace(/_/g,' ')

    db.tournament.find({where: {name:{ilike:name}}}).then(function(tourney) {
        var url = "http://aligulac.com/api/v1/player/set/"+tourney.roster.join(';')+"/?apikey="+ALIGULAC_KEY;
        request(url, function(error,response,data) {
        // async.map(tourney.roster,function(player,callback) {
            // request(url + player,function(error,response,data) {
               if(!error && response.statusCode == 200) {
                // console.log("Pulling data for player: " + player);
                // callback(null,JSON.parse(data).objects[0]);
                res.send({roster:JSON.parse(data).objects.sort(function(a,b) {return a.tag > b.tag ? 1:-1})});
            }
            else {
                console.log("Error:",error);
                res.send("Error: "+error);
            }
        });
        // }, function(err,result) {
        //     if (err) throw err;
        //     // console.log(result);
        //     res.send({roster:result});
        // });
});
});

// view a specific player's profile and stats
router.get('/pros/:player',function(req,res) {
    res.send(req.params);
});

router.get('/pros/:player/snapshot',function(req,res) {
    db.player.findOrCreate({where: {apiId:parseInt(req.params.player)}}).spread(function(player,created) {
        if(created || player.updatedAt < (new Date().getTime() - (7*24*60*60*1000))){


            var playerURL = "http://aligulac.com/api/v1/player/?apikey="+ALIGULAC_KEY+"&id="+req.params.player
            request(playerURL,function(error,response,playerData) {
                if(!error && response.statusCode == 200) {
                    console.log("Pulling data for player: " + req.params.player);
                // res.send(playerData);
                var ratingId = JSON.parse(playerData).objects[0].current_rating.id;

                request("http://aligulac.com/api/v1/activerating/?apikey="+ALIGULAC_KEY + "&id="+ratingId, function(error,response,ratingData){
                    if(!error && response.statusCode == 200) {

                        var id = JSON.parse(playerData).objects[0].id
                        var urls = ["http://aligulac.com/api/v1/match/?apikey="+ALIGULAC_KEY+"&limit=0&pla__id="+id,"http://aligulac.com/api/v1/match/?apikey="+ALIGULAC_KEY+"&limit=100&plb__id="+id]

                        async.map(urls,function(call,callback) {
                            request(call,function(error,response,data) {
                               if(!error && response.statusCode == 200) {
                                console.log("Pulling stat data:",call);

                                var dataArr = JSON.parse(data).objects.map(function(obj) {
                                    if (obj.pla.id == req.params.player) {
                                        return {player:obj.sca,opponent:obj.scb,matchup:"v" + obj.rcb};
                                    } else {
                                        return {player:obj.scb,opponent:obj.sca,matchup:"v" + obj.rca};
                                    }
                                });

                                callback(null,dataArr);
                            } else {
                                console.log("Error:",error);
                                res.send("Error: " + error);
                            }
                        });
                        },function(err,result) {
                            if (err) throw err;
                            var flatResults = result[0].concat(result[1]);
                            console.log("Stats loaded for:",req.params.player);

                            var ratings = JSON.parse(ratingData).objects[0] || {position:'N/A',position_vp:'N/A',position_vt:'N/A',position_vz:'N/A'};

                            player.name = JSON.parse(playerData).objects[0].tag;
                            player.team = JSON.parse(playerData).objects[0].current_teams.length > 0 ? JSON.parse(playerData).objects[0].current_teams[0].team.name : 'Free Agent';
                            player.country = JSON.parse(playerData).objects[0].country;
                            player.race = JSON.parse(playerData).objects[0].race;
                            var stats = {
                                vP:0, vPCount:0, vT:0, vTCount:0, vZ:0, vZCount:0, overall:0, overallCount:flatResults.length, rating:(ratings.position === 'N/A' ? false:true),
                                rank:ratings.position, vPRank:ratings.position_vp, vTRank:ratings.position_vt, vZRank:ratings.position_vz
                            }

                            for (var i = 0; i < flatResults.length; i++) {
                                switch(flatResults[i].matchup) {
                                    case 'vP':
                                    stats.overall += flatResults[i].player > flatResults[i].opponent ? 1:0;
                                    stats.vP += flatResults[i].player > flatResults[i].opponent ? 1:0;
                                    stats.vPCount++;
                                    break;
                                    case 'vT':
                                    stats.overall += flatResults[i].player > flatResults[i].opponent ? 1:0;
                                    stats.vT += flatResults[i].player > flatResults[i].opponent ? 1:0;
                                    stats.vTCount++;
                                    break;
                                    case 'vZ':
                                    stats.overall += flatResults[i].player > flatResults[i].opponent ? 1:0;
                                    stats.vZ += flatResults[i].player > flatResults[i].opponent ? 1:0;
                                    stats.vZCount++;
                                    break;
                                }
                            }
                            player.stats = JSON.stringify(stats);
                            player.save();
                            res.send(player);
                    // res.send({playerData:JSON.parse(playerData).objects[0],count:flatResults.length,results:flatResults,ratingData:JSON.parse(ratingData).objects[0]});
                });
}
else {
    console.log("Error:",error);
    res.send("Error: "+error);
}
});
}
else {
    console.log("Error:",error);
    res.send("Error: "+error);
}
});
}
else {
    res.send(player)
}
});
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