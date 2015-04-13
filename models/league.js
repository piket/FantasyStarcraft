"use strict";
module.exports = function(sequelize, DataTypes) {
  var league = sequelize.define("league", {
    name: DataTypes.STRING,
    endDate: DataTypes.DATE,
    userId: DataTypes.INTEGER,
    tournamentId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.league.hasMany(models.team);
        models.league.belongsTo(models.user);
        models.league.belongsTo(models.tournament);
      }
    }
  });
  return league;
};