"use strict";
module.exports = function(sequelize, DataTypes) {
  var team = sequelize.define("team", {
    name: DataTypes.STRING,
    players: DataTypes.ARRAY(DataTypes.INTEGER),
    userId: DataTypes.INTEGER,
    leagueId: DataTypes.INTEGER
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