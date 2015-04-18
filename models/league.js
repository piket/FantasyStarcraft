"use strict";
module.exports = function(sequelize, DataTypes) {
  var league = sequelize.define("league", {
    name: DataTypes.STRING,
    endDate: DataTypes.DATE,
    tournamentId: DataTypes.INTEGER,
    tournamentApiId: DataTypes.INTEGER
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