"use strict";
module.exports = function(sequelize, DataTypes) {
  var tournament = sequelize.define("tournament", {
    name: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    roster: DataTypes.ARRAY(DataTypes.STRING),
    location: DataTypes.STRING,
    prize: DataTypes.STRING,
    apiId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.tournament.hasMany(models.league);
      }
    }
  });
  return tournament;
};