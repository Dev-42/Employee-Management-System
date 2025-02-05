const { employeeDepartment } = require('../models/employeeDepartment.model');
const { employeeRole } = require('../models/employeeRole.model');
const { department } = require('../models/department.model');
const { role } = require('../models/role.model');

// helper function to get employee's associated departments
async function getEmployeeDepartments(employeeId) {
  const employeeDepartments = await employeeDepartment.findAll({
    where: { employeeId },
  });
  let departmentData = [];
  for (let empDep of employeeDepartments) {
    const Department = await department.findOne({
      where: { id: empDep.departmentId },
    });
    if (Department) {
      departmentData.push(Department);
    }
  }
  return departmentData;
}

// Helper function to get employee roles
async function getEmployeeRoles(employeeId) {
  const employeeRoles = await employeeRole.findAll({
    where: { employeeId },
  });
  let roleData = [];
  for (empRole of employeeRoles) {
    const Role = await role.findOne({
      where: { id: empRole.roleId },
    });
    if (Role) {
      roleData.push(Role);
    }
  }
  return roleData;
}

// Get complete employee details
async function getEmployeeDetails(employee) {
  const department = await getEmployeeDepartments(employee.id);
  const role = await getEmployeeRoles(employee.id);

  return { ...employee.dataValues, department, role };
}

module.exports = {
  getEmployeeDepartments,
  getEmployeeRoles,
  getEmployeeDetails,
};
