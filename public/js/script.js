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
        $.ajax({

        })
    }

    $('ul.roster>li.list-group-item').on('mouseenter',function(e) {
        $('.selected').removeClass('selected');
        $(e.target).addClass('selected');
    });

    if($('ul.roster').length > 0) {
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
                        break;
                    }
                default:
                    break;
            }
        });
    }


// end of document-loaded function
});