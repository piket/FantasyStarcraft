"use strict";

module.exports = {
  up: function(migration, DataTypes, done) {
    migration.changeColumn('teams','scores',DataTypes.TEXT);
    done();
  },

  down: function(migration, DataTypes, done) {
    migration.changeColumn('teams','scores',DataTypes.STRING);
    done();
  }
};
