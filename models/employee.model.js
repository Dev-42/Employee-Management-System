const { DataTypes } = require('sequelize');
const sequelize = require('../lib/db');

const employee = sequelize.define('employee', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});
module.exports = { employee };
