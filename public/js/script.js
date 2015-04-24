$(function(){
    console.log("Page loaded");


    $('#login').click(function(e) {
        e.preventDefault();
        $('.authBtn').hide();
        $('#loginForm').show();
        $('#username').focus();
    });

    $('#cancelLogin').click(function(e) {
        e.preventDefault();

        $('#username').val('');
        $('#password').val('');
        $('.authBtn').show();
        $('#loginForm').hide();
    });

    $('#signup').submit(function(e) {
        // e.preventDefault();
        var valid = true;
        $('.alertLabel').hide();

        if($('#pwd').val().length < 8) {
            $('#pwdLabel').show();
            valid = false;
        }
        else if($('#pwd').val() !== $('#pwd2').val()) {
            $('#pwd2Label').show();
            valid = false;
        }

        if($('#uname').val().length < 4) {
            $('#unameLabel').show();
            valid = false;
        }

        if($('#email').val().length < 5 || $('#email').val().indexOf('@') === -1) {
            $('#emailLabel').show();
            valid = false;
        }

        if (!valid) {
            e.preventDefault();
        }
    });

    var snapshot = function(playerId) {
        $('.statTable').hide();
        $('div.stats>img.loading').show();
        $('#playerIcons').children().remove();
        $.ajax({
            method: 'get',
            url: '/pros/' + playerId + '/snapshot',
        }).done(function(data) {
            // console.log(data.name);
            $('#playerName').text(data.name);
            $('#playerIcons').append('<img src="/images/teams/'+data.team+'.png" class="teamName icon-lg slot-img" style="top:0;right:200px">');
            $('#playerIcons').append('<img src="/images/'+data.race+'.png" class="icon-sm race-icon slot-img" style="top:-7px;right:120px">');

            var matchStats = JSON.parse(data.stats);

            $('#overallRecord').val((matchStats.overall/matchStats.overallCount*100).toFixed(2) + "%").css({width:((matchStats.overall/matchStats.overallCount*100).toFixed(2) + "%")}).children('span').text(((matchStats.overall/matchStats.overallCount*100).toFixed(2) + "%"));
            $('#vP').val((matchStats.vP/matchStats.vPCount*100).toFixed(2) + "%").css({width:((matchStats.vP/matchStats.vPCount*100).toFixed(2) + "%")}).children('span').text((matchStats.vP/matchStats.vPCount*100).toFixed(2) + "%");
            $('#vT').val((matchStats.vT/matchStats.vTCount*100).toFixed(2) + "%").css({width:((matchStats.vT/matchStats.vTCount*100).toFixed(2) + "%")}).children('span').text((matchStats.vT/matchStats.vTCount*100).toFixed(2) + "%");
            $('#vZ').val((matchStats.vZ/matchStats.vZCount*100).toFixed(2) + "%").css({width:((matchStats.vZ/matchStats.vZCount*100).toFixed(2) + "%")}).children('span').text((matchStats.vZ/matchStats.vZCount*100).toFixed(2) + "%");

            var numSign = (matchStats.rating ? '#':'');

            $('#overallRank').text(numSign+matchStats.rank);
            $('#vPRank').text(numSign+matchStats.vPRank);
            $('#vTRank').text(numSign+matchStats.vTRank);
            $('#vZRank').text(numSign+matchStats.vZRank);

            $('div.stats>img.loading').hide();
            $('.statTable').show();
        });
}

// if on a tournament page
if($('ul.roster').is('ul')) {
    $('div.roster>img.loading').show();
    var teamLoaded = false;

    $.ajax({
        method: 'get',
        url: '/manage/get/'+$('#selectLeague').val()
    }).done(function(data) {
        console.log("Data:",data);
        if(data !== false) {
            for(var i = 0; i < 6; i++) {
                var openSlot = $('.slot').first().addClass('filled').removeClass('slot');
                openSlot.children('h3').text(data[i].name);
                openSlot.append('<img src="/images/teams/'+data[i].team+'.png" class="teamName icon-lg slot-img">');
                openSlot.append('<img src="/images/'+data[i].race+'.png" class="icon-sm race-icon slot-img" style="top:47px">');
            }
            $('#inputTeamName').val(data[6]);
            $('#createTeamBtn').slideUp();
            teamLoaded = true;
        }
        else {
            $('.add-btn').show();
        }
    });

    // console.log(teamLoaded)

    $.ajax({method: 'get',url: $('#param').val()}).done(function(rosterData) {
        // console.log(rosterData.roster)
        rosterData.roster.forEach(function(player, idx) {
            if (player.team) {
                var playerTeam = player.team;
            }
            else {
                var playerTeam = player.current_teams.length > 0 ? player.current_teams[0].team.name:'Free Agent';
            }
            var listItem = '<li id="'+(player.apiId ? player.apiId:player.id)+'" class="list-group-item'+(idx === 0 ? ' selected':'')+'"><img src="/images/flags_iso/24/'
            +player.country.toLowerCase()+'.png" class="icon-sm pull-left"><span class="player-tag">' +(player.tag ? player.tag:player.name)+'</span><img src="/images/'
            +player.race+'.png" class="icon-sm race-icon"> <img class="teamName icon-lg" title="'+playerTeam+'" src="/images/teams/'+playerTeam+'.png">';

            if ($('#login').is('a')) {
                listItem += '</li>';
            }
            else {
                listItem += '<button class="btn btn-default btn-xs add-btn"><span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span></button></li>';
            }
                // console.log(listItem)
                $('ul.roster').append($(listItem));
            });
    if (teamLoaded) {
        $('.add-btn').hide();
    }
    $('div.roster>img.loading').remove();

    snapshot($('.selected').attr('id'));


$('ul.roster>li.list-group-item').on('mouseenter',function(e) {
    $('.selected').removeClass('selected');
    $(e.target).addClass('selected');
});

$('li.list-group-item').click(function(e) {
                // console.log(e.target)
                if($(e.target).is('span')) {
                    var btn = $(e.target).parent();
                }
                else {
                    var btn = $(e.target)
                }
                if(btn.hasClass('add-btn')) {
                    // console.log("Add",$(this).siblings('.player-tag').text(),$(this).parent());
                    if ($('.filled').length < 6) {

                        btn.removeClass('add-btn').addClass('remove-btn').children('span').removeClass('glyphicon-ok-sign').addClass('glyphicon-remove-circle');

                        var openSlot = $('.slot').first().addClass('filled').removeClass('slot');
                        openSlot.children('h3').text($(this).text());
                        var teamImg = $(this).children('img.teamName').clone();
                        var raceImg = $(this).children('img.race-icon').clone();
                        openSlot.append(teamImg.addClass('slot-img'));
                        openSlot.append(raceImg.addClass('slot-img').css({top:'47px'}));

                        $('#inputSlot'+openSlot.attr('id').slice(-1)).val($(this).attr('id'));
                        btn.attr('data',openSlot.attr('id'));

                        $(openSlot).click(function(e) {
                            $(this).removeClass('filled').addClass('slot').children('h3').text('Empty Player Slot');
                            $(this).children('.slot-img').remove();
                        });
                    }
                    btn.blur();
                    $('.remove-btn').hover(function(e) {
                        $(this).children('span').removeClass('glyphicon-ok-circle').addClass('glyphicon-remove-circle');
                    },function(e) {
                        $(this).children('span').removeClass('glyphicon-remove-circle').addClass('glyphicon-ok-circle');
                    });
                } else if (btn.hasClass('remove-btn')) {
                    // console.log("Remove")
                    btn.removeClass('remove-btn').addClass('add-btn').children('span').removeClass('glyphicon-remove-circle').addClass('glyphicon-ok-sign');

                    $('#'+btn.attr('data')).removeClass('filled').addClass('slot').children('h3').text('Empty Player Slot').siblings('.slot-img').remove();
                    btn.blur();
                }
                    // console.log("Other")
                    $('.selected').removeClass('selected');
                    $(this).addClass('selected');
                    snapshot($('.selected').attr('id'));
            });

$('.add-btn').hover(function(e) {
    var glyph = $(this).children('span');
    if(glyph.hasClass('glyphicon-plus-sign')) {
        glyph.removeClass('glyphicon-plus-sign').addClass('glyphicon-ok-sign');
    }
    else if (glyph.hasClass('glyphicon-ok-circle')) {
        glyph.removeClass('glyphicon-ok-circle').addClass('glyphicon-remove-circle');
    }
},function(e) {
    var glyph = $(this).children('span');
    if(glyph.hasClass('glyphicon-ok-sign')) {
        glyph.removeClass('glyphicon-ok-sign').addClass('glyphicon-plus-sign');
    }
    else if (glyph.hasClass('glyphicon-ok-circle')) {
        glyph.removeClass('glyphicon-remove-circle').addClass('glyphicon-ok-circle');
    }
});


$('#selectLeague').change(function() {
    $.ajax({
        method: 'get',
        url: '/manage/get/'+$(this).val()
    }).done(function(data) {
        console.log("Data:",data)
        if(data !== false) {
            for(var i = 0; i < 6; i++) {
                var openSlot = $('.slot').first().addClass('filled').removeClass('slot');
                openSlot.children('h3').text(data[i].name);
                openSlot.append('<img src="/images/teams/'+data[i].team+'.png" class="teamName icon-lg slot-img">');
                openSlot.append('<img src="/images/'+data[i].race+'.png" class="icon-sm race-icon slot-img" style="top:47px">');
            }
            $('#inputTeamName').val(data[6]);
            $('#createTeamBtn').slideUp();
            $('.remove-btn').removeClass('remove-btn').addClass('add-btn');
            $('.add-btn').hide();
        }
        else {
            $('#inputTeamName').val('');
            $('#createTeamBtn').slideDown();
            var filledSlot = $('.filled').removeClass('filled').addClass('slot');
            filledSlot.children('img').remove();
            filledSlot.children('h3').text('Empty Player Slot');
            $('.add-btn').show();
        }
    });
});
});

$('#createTeamForm').submit(function(e) {
    if($('.filled').length < 6) {
        e.preventDefault();
    }
});

$(document).on('keydown',function(e) {
    switch(e.which) {
        case 38:
        e.preventDefault();
        if($('ul.roster>li.list-group-item').first().hasClass('selected')) {
            break;
        } else {
            // console.log("previous item")
            $('.selected').removeClass('selected').prev().addClass('selected');
                        // if ($('div.roster').scrollTop() / 41 < $('ul.roster>li.list-group-item').length - 8) {
                            $('div.roster').scrollTop($('div.roster').scrollTop() -41);
                        // }
                        snapshot($('.selected').attr('id'));
                        break;
                    }
                    case 40:
                    e.preventDefault();
                    if($('ul.roster>li.list-group-item').last().hasClass('selected')) {
                        break;
                    } else {
                        // console.log("next item")
                        $('.selected').removeClass('selected').next().addClass('selected');
                        if($('ul.roster>li.list-group-item').index($('.selected')) > 8) {
                          $('div.roster').scrollTop($('div.roster').scrollTop() + 41);
                      }
                      snapshot($('.selected').attr('id'));
                      break;
                  }
                  default:
                  break;
              }
          });
}

if($('table.team-table').is('table')) {
        // on the account page
        // $('.teamId').each(function(idx,team) {

    var loadTable = function(idx) {
        if (idx < $('.team-table').length) {
            var team = $('.teamId').eq(idx);
            var id = '#' + $(team).val();
            var loaderid = '#loader' + $(team).val();
            // console.log("\n\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\nLoading:",$(team).val());
            // console.log("table id:",id,'loader id:',loaderid)
            // console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n");

            $.ajax({
                method: 'get',
                url: '/manage/pros/'+team.val()
            }).done(function(data) {
                // console.log("Data loaded:",data);
                var total = 0;
                $(loaderid).remove();

                for(var player in data.scores) {
                    // console.log(player);
                    if (player !== "date") {
                        var playerLine = '<tr><td>'+data.scores[player].name+'</td><td class="text-center">'+data.scores[player].wins+'</td><td class="text-center">'+data.scores[player].loses+'</td><td class="text-center">'+data.scores[player].streaks+'</td><td class="text-center">'+data.scores[player].points+'</td></tr>';
                        $(id).append(playerLine)
                        total += data.scores[player].points;
                    }
                }
                $(id).children().children().children('.total').text(total);
                loadTable(idx+1);
            });
        }
    }

    loadTable(0);
}

    $('#joinForm').submit(function(e) {
        e.preventDefault();
        $.ajax({
            method: 'put',
            url: $(this).attr('action'),
            data: $(this).serialize()
        }).done(function(response) {
            // console.log(response)
            location.href = '/manage/leagues';
        });
    });

    $('.alert').delay(5000).slideUp();

    if($('#username2').is('input')) $('#username2').focus();

// end of document-loaded function
});