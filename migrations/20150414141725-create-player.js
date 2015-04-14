"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("players", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      name: {
        type: DataTypes.STRING
      },
      team: {
        type: DataTypes.STRING
      },
      country: {
        type: DataTypes.STRING
      },
      race: {
        type: DataTypes.STRING
      },
      stats: {
        type: DataTypes.STRING
      },
      apiId: {
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
    migration.dropTable("players").done(done);
  }
};