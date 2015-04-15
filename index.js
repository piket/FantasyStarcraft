var request = require('request');
var session = require('express-session');
var flash = require('connect-flash');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended:false}));

app.use(session({
  secret:'dsalkfjasdflkj2469gdfblknbad43632iadsn87kl',
  resave: false,
  saveUninitialized: true
}));

app.use(flash());

app.use(express.static(__dirname+'/public'));

app.use(function(req,res,next) {
    res.locals.user = req.session.user || false;

    res.locals.lastPage = req.header('Referrer');
    console.log(res.locals.lastPage)

    res.locals.alerts = req.flash();

    res.locals.checkDate = function(dateStr) {
        console.log(dateStr)
        var date = new Date();
        var month = dateStr.slice(0,3);
        var m = -2;

        switch (month) {
            case 'Jan':
                m = 0;
                break;
            case 'Feb':
                m = 1;
                break;
            case 'Mar':
                m = 2;
                break;
            case 'Apr':
                m = 3;
                break;
            case 'May':
                m = 4;
                break;
            case 'Jun':
                m = 5;
                break;
            case 'Jul':
                m = 6;
                break;
            case 'Aug':
                m = 7;
                break;
            case 'Sep':
                m = 8;
                break;
            case 'Oct':
                m = 9;
                break;
            case 'Nov':
                m = 10;
                break;
            case 'Dec':
                m = 11;
                break;
            default:
                m = -1;
                break;
        }

        if (m <= date.getMonth()) return false;
        if (parseInt(dateStr.slice(4)) <= date.getDate() && m === date.getMonth()) return false;

        return true;
    }

    next();
});

app.use('/',require('./controllers/main.js'));
app.use('/auth',require('./controllers/auth.js'));
app.use('/manage',require('./controllers/manage.js'));

app.listen(process.env.PORT || 3000,function(){
    console.log('Server is connected');
});
