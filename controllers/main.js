var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var db = require('../models');
var async = require('async');
var router = express.Router();

// main page, lists upcoming tournaments
router.get('/',function(req,res) {
    var url = "http://wiki.teamliquid.net/starcraft2/Premier_Tournaments"
    request(url,function(error,response,data) {
        if(!error && response.statusCode == 200) {
            console.log("Pulling data...");
            var $ = cheerio.load(data);
            var events = $('h3').first().next('table').children('tr').map(function(idx,row) {
                return new Array($(row).children().map(function(i,item) {
                    if($(item).children('span').text() !== "") {
                        // return $(item).html();
                        return new $(item).html().slice($(item).html().indexOf('</span>')+7).trim();
                    }
                    else if (i == 2 && idx !== 0) {
                        return {text:$(item).text().trim(),href:$(item).children().attr('href').slice(12).replace('/','+')};
                    }
                    return $(item).text().trim();
                }).get());
            }).get();
            // res.send(events);
            res.render('main/index',{events:events});
        }
        else {
            console.log("Error:",error);
            res.send("Error: " + error);
        }
    })

    // var now = new Date();
    // var currentDate = now.getFullYear() +"-"+(now.getMonth()+1) + "-" + now.getDate();
    // var url = "http://aligulac.com/api/v1/event?apikey="+process.env.ALIGULAC_KEY+"&type=event&latest__isnull=false&order_by=-latest&limit=40&latest__gte="+currentDate;

    //  request(url,function(error,response,data){
    //     if(!error && response.statusCode == 200) {
    //         console.log("Pulling data...");
    //         res.send(data);
    //     }
    //     else {
    //         console.log("Error:",error);
    //         res.send("Error: "+error);
    //     }
    // });


    // res.render('main/index');
});

router.get('/gen_tourney',function(req,res) {
    var playerRoster = [
    "San", "Panic", "YongHwa", 'First', 'Seed', 'Dear', 'Super', 'Terminator', 'Rain', 'MC', 'FanTaSy', 'MarineKing', 'GuMiho', 'Bomber', 'Hack', 'TaeJa', 'Heart',
    'YoDa', 'Dream', 'Maru', 'PenguiN', 'Curious', 'Dark', 'Soulkey', 'Pigbaby', 'Bbyong'  , 'Impact',
    'Trap',  'SuperNova'   ,  'Sacsri',
    'MyuNgSiK',    'Sorry',   'Shine',
    'Trust'   ,'Flash' , 'Symbol',
    'Patience',  'Ryung',  'RagnaroK',
    'sOs' ,  'Cure', 'ByuL',
    'Creator',     'BrAvO',  'soO',
    'HerO'  ,   'DongRaeGu',
    'Billowy'
    ];
    var startDate = new Date(2015,3,1);
    var endDate = new Date(2015,5,27);
    db.tournament.find({where: {name:"2015 Global Starcraft II League Season 2"}}).then(function(tourney) {
        if(tourney !== null) {
            async.map(playerRoster.map(function(player) {return "http://aligulac.com/api/v1/player/?apikey="+process.env.ALIGULAC_KEY+"&tag="+player}),
                function(player,callback) {
                    request(player,function(error,response,data) {
                        if(!error && response.statusCode == 200) {
                            console.log("Pulling data...\n");
                            callback(null,JSON.parse(data).objects[0].id)
                        }
                        else {
                            console.log("Error:",error);
                            callback(error);
                        }
                    })
                },function(err,result) {
                if(err) throw err;
                    tourney.roster = result.sort(function(a,b){return parseInt(a)-parseInt(b)});
                    console.log(tourney.roster);
                    tourney.save();
                    res.send(tourney);
                });

        }
    })
})

router.get('/test',function(req,res) {
    var now = new Date();
    var currentDate = now.getFullYear() +"-"+(now.getMonth()+1) + "-" + now.getDate();
     // var url = "http://aligulac.com/api/v1/event?apikey="+process.env.ALIGULAC_KEY+"&uplink__parent=43682&distance__range=1,3&limit=100"; // KeSPA 2015 Season 1
     // var url = "http://aligulac.com/api/v1/event?apikey="+process.env.ALIGULAC_KEY +"&uplink__parent=39565&distance__range=1,3&limit=100" // WCS 2015 Season 2
     // var url = "http://aligulac.com/api/v1/event?apikey="+process.env.ALIGULAC_KEY+"&uplink__parent=41322&distance__range=1,3&limit=100" // GSL 2015 Season 2
     var url = "http://aligulac.com/api/v1/match?apikey="+process.env.ALIGULAC_KEY+"&eventobj__uplink__parent=41322&limit=0" // all matches for GSL 2015 Season 2
     // var url = "http://aligulac.com/search/json?q=life" // use built-in search function
     // var url ="http://aligulac.com/api/v1/activerating/?apikey="+process.env.ALIGULAC_KEY+"&order_by=-rating" // master ranking list
     // var url ="http://aligulac.com/api/v1/player/?apikey="+process.env.ALIGULAC_KEY+"&id=3"
     // var url = "http://aligulac.com/api/v1/activerating?apikey="+process.env.ALIGULAC_KEY + "&player__id=3"//id=5308675"
     // var url = "http://aligulac.com/api/v1/match/?apikey="+process.env.ALIGULAC_KEY+"&pla__id=3"
     // var url2 = "http://aligulac.com/api/v1/match/?apikey="+process.env.ALIGULAC_KEY+"&plb__id=3"
     // var url = "http://aligulac.com/api/v1/event/?apikey="+process.env.ALIGULAC_KEY+"&order_by=period"
     // async.map([url,url2],function(call,callback) {

     request(url,function(error,response,data){
        if(!error && response.statusCode == 200) {
            console.log("Pulling data...\n");
            // callback(null,data);
            res.send(data);
        }
        else {
            console.log("Error:",error);
            // callback(error);
        }
    });
     // }, function(err,result) {
     //    res.send(result);
     // })
 });

// listing of pros with sorting and filtering options
router.get('/pros',function(req,res) {
    res.send("pro rankings");
});

// view a specific tournament's details and roster
router.get('/tournament/:tournament',function(req,res) {
    console.log(req.params.tournament)
    var url = "http://aligulac.com/api/v1/player/?apikey="+process.env.ALIGULAC_KEY + "&tag=";

    var name = req.params.tournament.replace(/_/g,' ')

    db.tournament.find({where: {name:{ilike:name}}}).then(function(tourney) {
        // async.map(tourney.roster,function(player,callback) {
        //     request(url + player,function(error,response,data) {
        //      if(!error && response.statusCode == 200) {
        //         console.log("Pulling data for player: " + player);
        //         callback(null,JSON.parse(data).objects[0]);
        //     }
        //     else {
        //         console.log("Error:",error);
        //         res.send("Error: "+error);
        //     }
        // });
        // }, function(err,result) {
        //     if (err) throw err;
            // res.send(result);
            res.render('main/tournament',{param:req.params.tournament,name:tourney.name,start:tourney.startDate,end:tourney.endDate});
        // });
    });
    // var url = "http://wiki.teamliquid.net/starcraft2/" + req.params.tournament.replace('+','/');

    // request(url,function(error,response,data) {
    //     if(!error && response.statusCode == 200) {
    //         console.log("Pulling data...");
    //         var $ = cheerio.load(data);
    //         res.send();
    //     }
    //     else {
    //         console.log("Error:",error);
    //         res.send("Error: "+error);
    //     }
    // });
    // res.send(req.params)
});

router.get('/pull/:tournament',function(req,res) {
    console.log(req.params.tournament)

    var name = req.params.tournament.replace(/_/g,' ')

    db.tournament.find({where: {name:{ilike:name}}}).then(function(tourney) {
        var url = "http://aligulac.com/api/v1/player/set/"+tourney.roster.join(';')+"/?apikey="+process.env.ALIGULAC_KEY;
        request(url, function(error,response,data) {
        // async.map(tourney.roster,function(player,callback) {
            // request(url + player,function(error,response,data) {
             if(!error && response.statusCode == 200) {
                // console.log("Pulling data for player: " + player);
                // callback(null,JSON.parse(data).objects[0]);
                res.send({roster:JSON.parse(data).objects});
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
    var playerURL = "http://aligulac.com/api/v1/player/?apikey="+process.env.ALIGULAC_KEY+"&id="+req.params.player
    request(playerURL,function(error,response,playerData) {
        if(!error && response.statusCode == 200) {
                console.log("Pulling data for player: " + req.params.player);
                // res.send(playerData);
                var ratingId = JSON.parse(playerData).objects[0].current_rating.id;

                request("http://aligulac.com/api/v1/activerating/?apikey="+process.env.ALIGULAC_KEY + "&id="+ratingId, function(error,response,ratingData){
                    if(!error && response.statusCode == 200) {

                var id = JSON.parse(playerData).objects[0].id
                var urls = ["http://aligulac.com/api/v1/match/?apikey="+process.env.ALIGULAC_KEY+"&limit=100&pla__id="+id,"http://aligulac.com/api/v1/match/?apikey="+process.env.ALIGULAC_KEY+"&limit=100&plb__id="+id]

                async.map(urls,function(call,callback) {
                    request(call,function(error,response,data) {
                     if(!error && response.statusCode == 200) {
                        console.log("Pulling stat data:",call);

                        var dataArr = JSON.parse(data).objects.map(function(obj) {
                            if (obj.pla.id == req.params.player) {
                                return {player:obj.sca,opponent:obj.scb,matchup:obj.rca + "v" + obj.rcb};
                            } else {
                                return {player:obj.scb,opponent:obj.sca,matchup:obj.rcb + "v" + obj.rca};
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
                    res.send({playerData:JSON.parse(playerData).objects[0],count:flatResults.length,results:flatResults,ratingData:JSON.parse(ratingData).objects[0]});
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