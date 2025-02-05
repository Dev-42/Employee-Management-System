const sequelize = require('../lib/db');
const { DataTypes } = require('sequelize');

const department = sequelize.define('department', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});
module.exports = { department };
