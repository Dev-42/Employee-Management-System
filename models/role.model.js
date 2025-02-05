const { DataTypes } = require('sequelize');
const sequelize = require('../lib/db');

const role = sequelize.define('role', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});
module.exports = { role };
