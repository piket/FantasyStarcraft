"use strict";

var bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define("user", {
    name: {
        type: DataTypes.STRING,
        validate: {
          len: {args: [4,30], msg: 'Your username must be between 3 and 30 characters long.'}
        }
      },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        len: {args: [8,100], msg: 'Your password must be at least 8 characters long'}
      }
    }
  },{
  hooks: {
    beforeCreate: function(user,options,sendback) {
        bcrypt.hash(user.password,10,function(err,hash){
          if(err){ throw err; }
          user.password=hash;
          sendback(null,user);
        });
      }
    },
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.user.hasMany(models.team);
        models.user.belongsToMany(models.league, {through: models.leaguesusers, foreignKey: 'userId'});
      }
    }
  });
  return user;
};