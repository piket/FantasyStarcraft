"use strict";
module.exports = function(sequelize, DataTypes) {
  var player = sequelize.define("player", {
    name: DataTypes.STRING,
    team: DataTypes.STRING,
    country: DataTypes.STRING,
    race: DataTypes.STRING,
    stats: DataTypes.STRING,
    apiId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return player;
};