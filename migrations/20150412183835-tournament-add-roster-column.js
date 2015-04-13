"use strict";

module.exports = {
  up: function(migration, DataTypes, done) {
    migration.addColumn('tournaments','roster',DataTypes.ARRAY(DataTypes.STRING));
    done();
  },

  down: function(migration, DataTypes, done) {
    migration.removeColumn('tournaments','roster');
    done();
  }
};
