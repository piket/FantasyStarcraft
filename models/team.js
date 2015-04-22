"use strict";
module.exports = function(sequelize, DataTypes) {
  var team = sequelize.define("team", {
    name: {
        type: DataTypes.STRING,
        validate: {
          len: {args: [3,30], msg: 'Your team name must be between 3 and 30 characters long'}
        }
      },
    players: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        validate: {
          len: { agrs: [6], msg: 'Your team must consist of exactly 6 players.'}
        }
      },
    userId: DataTypes.INTEGER,
    leagueId: DataTypes.INTEGER,
    scores: DataTypes.TEXT
  }, {
    hooks: {
      beforeCreate: function(team,options,sendback) {
        sendback(null,team);
      }
    },
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.team.belongsTo(models.user);
        models.team.belongsTo(models.league);
      }
    }

  });
  return team;
};