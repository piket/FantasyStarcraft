"use strict";

module.exports = {
  up: function(migration, DataTypes, done) {
    migration.addColumn('teams','scores',DataTypes.STRING);
    done();
  },

  down: function(migration, DataTypes, done) {
    migration.removeColumn('teams','scores');
    done();
  }
};
