var express = require('express');
var db = require('../models');
var router = express.Router();
var request = require('request');
var Hashids = require('hashids');
var hashids = new Hashids(process.env.HASH_SALT,20);

router.post('/create/team',function(req,res) {
    // db call to create your team
    var players = [req.body.slot1,req.body.slot2,req.body.slot3,req.body.slot4,req.body.slot5,req.body.slot6];
    db.team.findOrCreate({where: {name:req.body.name,userId:req.session.user.id}, defaults: {name:req.body.name,players:players}})
        .spread(function(team,created) {
            if(created) {
                console.log("Team created");
                db.user.find(req.session.user.id).then(function(thisUser) {
                    db.league.findAll({include: [db.user], where: {tournamentId:req.body.tournamentId}}).then(function(leagues) {
                        leagues.forEach(function(league) {
                            for (var i = 0; i < league.users.length; i++) {
                                if(league.users[i].id === req.session.user.id) {
                                    league.addTeam(team);
                                    thisUser.addTeam(team);
                                    return;
                                }
                            }
                        })
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

router.get('/pros/:player', function(req,res) {
    var players = req.params.player.split(';');
    console.log("/manage/pros/ called");
    var playersURL ="http://aligulac.com/api/v1/player/set/"+req.params.player+"?apikey="+'pEtSegtDJUOLseef32gl'
    var url = "http://aligulac.com/api/v1/match?apikey="+'pEtSegtDJUOLseef32gl'+"&eventobj__uplink__parent=41322&limit=0"
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

router.get('/leagues',function(req,res) {
    if(req.session.user) {
        db.league.findAll({include: [db.user,db.team,db.tournament]}).then(function(leagues){
        // db.user.find({where: {id:req.session.user.id}, include: [{model:db.league,include: [db.tournament,{model:db.team, include:[db.user]}]}]}).then(function(user) {
            // res.send(leagues);
            // res.send(user);
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
        // user.leagues.forEach(function(league) {

        // })
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
})

module.exports = router;