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

        if($('#uname').val().length < 1) {
            $('#unameLabel').show();
            valid = false;
        }

        if($('#email').val().length < 7 && $('#email').text().indexOf('@') === -1) {
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
        $.ajax({
            method: 'get',
            url: '/pros/' + playerId + '/snapshot',
        }).done(function(data) {
            // var matchStats = {
            //     vP:0, vPCount:0, vT:0, vTCount:0, vZ:0, vZCount:0, overall:0
            // }

            // for (var i = 0; i < data.results.length; i++) {
            //     switch(data.results[i].matchup.slice(1)) {
            //         case 'vP':
            //             matchStats.overall += data.results[i].player > data.results[i].opponent ? 1:0;
            //             matchStats.vP += data.results[i].player > data.results[i].opponent ? 1:0;
            //             matchStats.vPCount++;
            //             break;
            //         case 'vT':
            //             matchStats.overall += data.results[i].player > data.results[i].opponent ? 1:0;
            //             matchStats.vT += data.results[i].player > data.results[i].opponent ? 1:0;
            //             matchStats.vTCount++;
            //             break;
            //         case 'vZ':
            //             matchStats.overall += data.results[i].player > data.results[i].opponent ? 1:0;
            //             matchStats.vZ += data.results[i].player > data.results[i].opponent ? 1:0;
            //             matchStats.vZCount++;
            //             break;
            //     }
            // }
            var matchStats = JSON.parse(data.stats);

            $('#overallRecord').text((matchStats.overall/matchStats.overallCount*100).toFixed(2) + "%");
            $('#vP').text((matchStats.vP/matchStats.vPCount*100).toFixed(2) + "%");
            $('#vT').text((matchStats.vT/matchStats.vTCount*100).toFixed(2) + "%");
            $('#vZ').text((matchStats.vZ/matchStats.vZCount*100).toFixed(2) + "%");

            var numSign = (matchStats.rating ? '#':'');

            $('#overallRank').text(numSign+matchStats.rank);
            $('#vPRank').text(numSign+matchStats.vPRank);
            $('#vTRank').text(numSign+matchStats.vTRank);
            $('#vZRank').text(numSign+matchStats.vZRank);

            $('div.stats>img.loading').hide();
            $('.statTable').show();
        });
}


    // $('ul.roster>li.selected').click(function(){
    //     snapshot($(this).attr('id'));
    // })

if($('ul.roster').is('ul')) {
    $('div.roster>img.loading').show()
    $.ajax({method: 'get',url: $('#param').val()}).done(function(rosterData) {
            // console.log(rosterData.roster)
            rosterData.roster.forEach(function(player, idx) {
                var listItem = '<li id="'+player.id+'" class="list-group-item'+(idx === 0 ? ' selected':'')+'"><img src="/images/flags_iso/24/'
                +player.country.toLowerCase()+'.png" class="icon-sm pull-left"><span class="player-tag">' +player.tag+'</span><img src="/images/'
                +player.race+'.png" class="icon-sm race-icon"> <img class="teamName icon-lg" title="'+(player.current_teams.length > 0 ? player.current_teams[0].team.name:'Free Agent')
                +'" src="/images/teams/'+(player.current_teams.length > 0 ? player.current_teams[0].team.name:'Free Agent') +'.png">';

                if ($('#login').is('a')) {
                    listItem += '</li>';
                }
                else {
                    listItem += '<button class="btn btn-default btn-xs add-btn"><span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span></button></li>';
                }
                // console.log(listItem)
                $('ul.roster').append($(listItem));
            });
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
                            openSlot.children('h4').text($(this).text());

                            $('#inputSlot'+openSlot.attr('id').slice(-1)).val($(this).attr('id'));
                            btn.attr('data',openSlot.attr('id'));

                            $(openSlot).click(function(e) {
                                $(this).removeClass('filled').addClass('slot').children('h4').text('');
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

                        $('#'+btn.attr('data')).removeClass('filled').addClass('slot').children('h4').text('');
                        btn.blur();
                } else {
                    // console.log("Other")
                    $('.selected').removeClass('selected');
                    $(this).addClass('selected');
                    snapshot($('.selected').attr('id'));
                }
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
            console.log("previous item")
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
                        console.log("next item")
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
        $('.playerArr').each(function(idx) {
            console.log("Loading:",$(this).val());

            $.ajax({
                method: 'get',
                url: '/manage/pros/'+$(this).val()
            }).done(function(data) {
                var total = 0;
                console.log(data)

                for(var player in data.scores) {
                    var playerLine = '<tr><td>'+data.scores[player].name+'</td><td class="text-center">'+data.scores[player].wins+'</td><td class="text-center">'+data.scores[player].loses+'</td><td class="text-center">'+data.scores[player].streaks+'</td><td class="text-center">'+data.scores[player].points+'</td></tr>';
                    $('#'+idx).append(playerLine)
                    total += data.scores[player].points;
                }
                $('#'+idx).children().children().children('.total').text(total);
            });
        });
    }

    $('#joinForm').submit(function(e) {
        e.preventDefault();
        $.ajax({
            method: 'put',
            url: $(this).attr('action'),
            data: $(this).serialize()
        }).done(function(response) {
            console.log(response)
            location.href = '/manage/leagues';
        });
    });


// end of document-loaded function
});