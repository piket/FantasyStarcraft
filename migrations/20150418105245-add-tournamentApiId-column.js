"use strict";

module.exports = {
  up: function(migration, DataTypes, done) {
    migration.addColumn('tournaments','apiId',DataTypes.INTEGER);
    migration.addColumn('leagues','tournamentApiId',DataTypes.INTEGER);
    done();
  },

  down: function(migration, DataTypes, done) {
    migration.removeColumn('tournaments','apiId');
    migration.removeColumn('leagues','tournamentApiId');
    done();
  }
};
