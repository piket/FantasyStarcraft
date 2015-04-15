"use strict";
module.exports = function(sequelize, DataTypes) {
  var leaguesusers = sequelize.define("leaguesusers", {
    leagueId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return leaguesusers;
};