var express = require('express');
var db = require('../models');
var router = express.Router();
var request = require('request');
var Hashids = require('hashids');
var hashids = new Hashids(process.env.HASH_SALT,20);

router.post('/create/team',function(req,res) {
    // db call to create your team
    var players = [req.body.slot1,req.body.slot2,req.body.slot3,req.body.slot4,req.body.slot5,req.body.slot6];
    db.team.findOrCreate({where: {name:req.body.name,leagueId:req.body.id}, defaults: {name:req.body.name,players:players}})
        .spread(function(team,created) {
            if(created) {
                console.log("Team created");
                db.user.find(req.session.user.id).then(function(thisUser) {
                    db.league.find(req.body.id).then(function(thisLeague) {
                        thisLeague.addTeam(team);
                        thisUser.addTeam(team);
                        res.redirect('/auth/account');
                    })
                })
            } else {
                req.flash('danger','You already have a team in this league');
                res.redirect('back');
            }
        })
    // res.send(req.body);
});

router.post('/create/league',function(req,res) {
    db.league.findOrCreate({where: {name:req.body.name}, defaults: {name:req.body.name,endDate:req.body.endDate}}).spread(function(league,created) {
        if(created) {
            db.tournament.find(req.body.tournamentId).then(function(tourney) {
                db.user.find(req.session.user.id).then(function(user) {
                    user.addLeague(league);
                    tourney.addLeague(league);
                    res.redirect('/tournament/'+tourney.name.replace(/ /g,'_'));
                })
            });
        }
        else {
            req.flash('danger','A league with that name already exists, please choose a new name');
            res.redirect('back');
        }
    });
});

router.get('/pros/:team', function(req,res) {
    // console.log("/manage/pros/ called");

    db.team.find({where: {id:req.params.team},include: [db.league]}).then(function(team) {
        console.log("Team found",team.name);
        if(team === null || team.scores === null || team.scores.date < (new Date().getTime() - (24*60*60*1000))) {
            var players = team.players;
            // res.send(team);
             var url = "http://aligulac.com/api/v1/match?apikey="+process.env.ALIGULAC_KEY+"&eventobj__uplink__parent="+team.league.tournamentApiId+"&limit=0"

             request(url,function(error,response,data) {
                if(!error && response.statusCode == 200) {
                    var matches = JSON.parse(data).objects
                    console.log("Pulling data:",players)
                    // res.send(matches);
                    var details = [];
                    for (var i = 0; i < matches.length; i++) {
                        if (players.indexOf(matches[i].pla.id) !== -1 || players.indexOf(matches[i].plb.id) !== -1) {
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
                    // res.send(details)
                    var scores = {};
                    team.players.forEach(function(player) {
                        var id = player;
                        var record = {wins:0,loses:0,streaks:0}
                        record.points = details.reduce(function(prev,current){
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
                                        record.streaks++;
                                        record.wins+=p;
                                        return prev + (p*2) + 1;
                                    }
                                    record.wins+=p;
                                    record.loses+=o;
                                    return prev + (p*2) - o;
                                case (p+o) <=7 && (p+o) >= 4:
                                    if(o === 0) {
                                        record.streaks++;
                                        record.wins+=p;
                                        return prev + (p*2) + 2;
                                    }
                                    record.wins+=p;
                                    record.loses+=o;
                                    return prev + (p*2) - o;
                                case (p+o) <= 11 && (p+o) >= 5:
                                    if (o === 0) {
                                        record.streaks++;
                                        record.wins+=p;
                                        return prev + (p*2) + 3;
                                    }
                                    record.wins+=p;
                                    record.loses+=o;
                                    return prev + (p*2) - o;
                                case (p+o) > 11:
                                    if (o === 0) {
                                        record.streaks++;
                                        record.wins+=p;
                                        return prev + (p*2) + 3;
                                    }
                                    record.wins+=p;
                                    record.loses+=o;
                                    return prev + (p*2) - o;
                                default:
                                    record.wins+=p;
                                    record.loses+=o;
                                    return prev + (p*2) - o;
                            }
                        },0);
                        scores[id] = record;
                        console.log("Record for",player,record)
                    });
                db.player.findAll({where: {apiId:players}}).then(function(playerArr) {
                    playerArr.forEach(function(player) {
                        scores[player.apiId].name = player.name;
                    });
                    console.log(scores);
                    scores.date = new Date();
                    team.scores = JSON.stringify(scores);
                    team.save();
                    res.send({scores:JSON.parse(team.scores)});
                });
            } else {
                console.log("Error:",error);
                res.send("Error: "+error)
                }
        });
        }
        else {
                res.send({scores:JSON.parse(team.scores)});
        }
    });
});

router.get('/leagues',function(req,res) {
    if(req.session.user) {
        db.league.findAll({include: [db.user,db.team,db.tournament]}).then(function(leagues){

            var renderObj = {
                leagues: leagues,
                findUser: function(userArr,id) {
                    for(var i = 0; i < userArr.length; i++) {
                        if (userArr[i].id === id) {
                            return userArr[i].name;
                        }
                    }
                    return false;
                },
                encode: function(id) {
                    return hashids.encode(id);
                },
                url: req.protocol +'://'+req.get('host')
            }
            res.render('main/league',renderObj);
        })
    }
    else {
        res.redirect('back');
    }
});

router.get('/join/:id',function(req,res) {
    var id = hashids.decode(req.params.id);

    db.league.find(id).then(function(league) {
        res.render('auth/join',{id:id,name:league.name});
    })
})

router.put('/join',function(req,res) {

    db.user.find({where: {id:req.session.user.id}, include:[db.league]}).then(function(user) {

        if(user) {
            db.league.find({where: {id:req.body.id}, include: [db.user]}).then(function(league) {
                    var flag = false;

                    for(var i = 0; i < league.users.length; i++) {
                        if (league.users[i].id === req.session.user.id) {
                            flag = true;
                        }
                    }

                    if(flag) {
                        req.flash('danger','You are already a member of this league.')
                    } else {
                        user.addLeague(league);
                        req.flash('success','Congratualtions, you have joined '+league.name);
                    }
                    res.send(flag);
            });
        }
        else {
            req.flash('danger','Error: user unknown');
            res.send(false);
        }
    })
});

router.get('/get/:id',function(req,res) {
    var mapPlayerData = function(obj) {
        return {name:obj.tag, team:obj.current_teams[0].team.name, race:obj.race};
    }

    if(req.session.user) {
        db.team.find({where: {userId:req.session.user.id, leagueId:req.params.id}}).then(function(team) {
            if(team === null) {
                res.send(false);
            }
            else {
                db.player.findAll({where: {apiId: team.players}}).then(function(players) {
                    if (players.length === 0) {
                        var players = team.players.join(';');
                        var playersURL ="http://aligulac.com/api/v1/player/set/"+players+"?apikey="+process.env.ALIGULAC_KEY

                        request(playersURL,function(error,response,data) {
                            if(!error && response.statusCode == 200) {
                                // res.send(data);
                                var playerData = JSON.parse(data).objects.map(mapPlayerData);
                                playerData.push(team.name);
                                    console.log("\n\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                                    console.log("Team data -no players found-:",playerData)
                                    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n");
                                res.send(playerData);
                            }
                            else {
                                res.send(false);
                            }
                        });
                    }
                    else {
                        var noPlayerData = team.players.filter(function(p) {
                            for(var i = 0; i < players.length; i++) {
                                if(players[i].apiId == p) {
                                    return false;
                                }
                            }
                            return true;
                        });

                        if(noPlayerData.length === 0) {
                            players.push(team.name);
                            res.send(players);
                        }
                        else {
                            var url = "http://aligulac.com/api/v1/player/set/"+noPlayerData.join(';')+"/?apikey="+process.env.ALIGULAC_KEY;
                            request(url, function(error,response,newPlayerData) {
                                   if(!error && response.statusCode == 200) {
                                    console.log("Pulling data for players without data" );

                                    var playerData = JSON.parse(newPlayerData).objects.map(mapPlayerData).concat(players);
                                    playerData.push(team.name);
                                    console.log("\n\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                                    console.log("Team data:",playerData)
                                    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n");
                                    res.send(playerData);
                                }
                                else {
                                    console.log("Error:",error);
                                    res.send("Error: "+error);
                                }
                            });
                        }
                    }
                })
            }
        });
    }
    else {
        res.send(false);
    }
});

module.exports = router;