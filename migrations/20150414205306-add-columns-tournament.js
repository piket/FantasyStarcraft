"use strict";

module.exports = {
  up: function(migration, DataTypes, done) {
    migration.addColumn('tournaments','location',DataTypes.STRING);
    migration.addColumn('tournaments','prize',DataTypes.STRING);
    done();
  },

  down: function(migration, DataTypes, done) {
    migration.removeColumn('tournaments','location');
    migration.removeColumn('tournaments','prize');
    done();
  }
};
