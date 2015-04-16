"use strict";

module.exports = {
  up: function(migration, DataTypes, done) {
    migration.dropTable("leaguesusers").done(done);
  },

  down: function(migration, DataTypes, done) {
    migration.createTable("leaguesusers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      leagueId: {
        type: DataTypes.INTEGER
      },
      userId: {
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
  }
};
