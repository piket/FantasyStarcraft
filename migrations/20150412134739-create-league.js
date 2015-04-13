"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("leagues", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      name: {
        type: DataTypes.STRING
      },
      endDate: {
        type: DataTypes.DATE
      },
      userId: {
        type: DataTypes.INTEGER
      },
      tournamentId: {
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
    migration.dropTable("leagues").done(done);
  }
};