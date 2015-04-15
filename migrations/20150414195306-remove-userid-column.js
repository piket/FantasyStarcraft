"use strict";

module.exports = {
  up: function(migration, DataTypes, done) {
    migration.removeColumn('leagues','userId');
    done();
  },

  down: function(migration, DataTypes, done) {
    migration.addColumn('leagues','userId',DataType.INTEGER);
    done();
  }
};
