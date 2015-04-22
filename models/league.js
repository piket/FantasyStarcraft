"use strict";
module.exports = function(sequelize, DataTypes) {
  var league = sequelize.define("league", {
    name: {
        type: DataTypes.STRING,
        validate: {
          len: {args: [3,30], msg: 'Your league name must be between 3 and 30 characters long'}
        }
      },
    endDate: DataTypes.DATE,
    tournamentId: DataTypes.INTEGER,
    tournamentApiId: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: true
      }
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.league.hasMany(models.team);
        models.league.belongsToMany(models.user,{through: models.leaguesusers, foreignKey: 'leagueId'});
        models.league.belongsTo(models.tournament);
      }
    }
  });
  return league;
};