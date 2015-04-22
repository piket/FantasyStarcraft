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

    res.locals.printDate = function(date) {
        var str = "";
        switch(date.getMonth()) {
            case 0:
                str = "Jan ";
                break;
            case 1:
                str = "Feb ";
                break;
            case 2:
                str = "Mar ";
                break;
            case 3:
                str = "Apr ";
                break;
            case 4:
                str = "May ";
                break;
            case 5:
                str = "Jun ";
                break;
            case 6:
                str = "Jul ";
                break;
            case 7:
                str = "Aug ";
                break;
            case 8:
                str = "Sep ";
                break;
            case 9:
                str = "Oct ";
                break;
            case 10:
                str = "Nov ";
                break;
            case 11:
                str = "Dec ";
                break;
            default:
                str = "??? ";
                break;
        }
        if (date.getDate() < 10) {
            str += "0"+date.getDate();
        }
        else {
            str += date.getDate();
        }
        return str;
    }

    next();
});

app.use('/',require('./controllers/main.js'));
app.use('/auth',require('./controllers/auth.js'));
app.use('/manage',require('./controllers/manage.js'));

app.use(function(req,res,next){
    res.status(404);

    res.render('main/error',{url:req.protocol +'://'+req.get('host')+req.url,error:"404 Page Not Found"});
});

app.listen(process.env.PORT || 3000,function(){
    console.log('Server is connected');
});
