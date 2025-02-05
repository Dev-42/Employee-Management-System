const { DataTypes } = require('sequelize');
const { role } = require('./role.model');
const { employee } = require('./employee.model');
const sequelize = require('../lib/db');

const employeeRole = sequelize.define('employeeRole', {
  employeeId: {
    type: DataTypes.INTEGER,
    references: {
      model: employee,
      key: 'id',
    },
  },
  roleId: {
    type: DataTypes.INTEGER,
    references: {
      model: role,
      key: 'id',
    },
  },
});

employee.belongsToMany(role, { through: employeeRole });
role.belongsToMany(employee, { through: employeeRole });

module.exports = { employeeRole };
