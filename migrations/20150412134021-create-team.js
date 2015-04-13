"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("teams", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      name: {
        type: DataTypes.STRING
      },
      players: {
        type: DataTypes.ARRAY(DataTypes.INTEGER)
      },
      userId: {
        type: DataTypes.INTEGER
      },
      leagueId: {
        type: DataTypes.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    }).done(done);
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable("teams").done(done);
  }
};