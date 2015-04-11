var express = require('express');
var bcrypt = require('bcrypt');
var db = require('../models');
var router = express.Router();

router.get('/account',function(req,res) {
    res.render('auth/account');
});

router.get('/signup',function(req,res) {
    res.render('auth/signup');
});

router.get('/login',function(req,res) {
    res.render('auth/login');
});

router.post('/signup',function(req,res) {
    db.user.findOrCreate({where: {email:req.body.email},defaults:{email:req.body.email,name:req.body.name,password:req.body.password}}).spread(function(user,created) {
        if (created) {
            req.flash('success','New user created. Please login.')
            res.redirect('auth/login')
        }
        else {
            req.flash('warning','There is already an account with that email address.');
            res.redirect('auth/signup');
        }
    }).catch(function(error) {
        if(error){
            if(Array.isArray(error.errors)){
                error.errors.forEach(function(errorItem){
                    req.flash('danger',errorItem.message);
                });
            }else{
                req.flash('danger','unknown error');
                console.log('unknown error',error);
            }
        }else{
            req.flash('danger','unknown error');
            console.log('error, but no error...');
        }
        res.redirect('/auth/signup');
    })
});

router.post('/login',function(req,res) {
    db.user.find({where:{email:req.body.email}}).then(function(user){
        if(user){
            //check password
            bcrypt.compare(req.body.password,user.password,function(err,result){
                if(err) throw err;

                if(result){
                    //store user to session!!
                    req.session.user={
                        id:user.id,
                        email:user.email,
                        name:user.name
                    };
                    req.flash('success','You have been logged in.');
                    res.redirect('/');
                }else{
                    req.flash('danger','Invalid password.');
                    res.redirect('/auth/login');
                }
            })
        }else{
            req.flash('danger','Unknown user. Please sign up.');
            res.redirect('/auth/login');
        }
    });
});

router.get('/logout',function(req,res){
    delete req.session.user;
    req.flash('info','You have been logged out.')
    res.redirect('/');
});

module.exports = router;