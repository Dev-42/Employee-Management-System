const express = require('express');
const cors = require('cors');

const sequelize = require('./lib/db');
const { employee } = require('./models/employee.model');
const { department } = require('./models/department.model');
const { role } = require('./models/role.model');
const { employeeDepartment } = require('./models/employeeDepartment.model');
const { employeeRole } = require('./models/employeeRole.model');
const { getEmployeeDetails } = require('./helpers/employee.helpers');

const app = express();
app.use(express.json());

app.use(cors());

app.get('/', (req, res) => {
  res.send('Cors is enabled for all origins');
});

app.get('/seed_db', async (req, res) => {
  try {
    await sequelize.sync({ force: true });

    const departments = await department.bulkCreate([
      { name: 'Engineering' },
      { name: 'Marketing' },
    ]);

    const roles = await role.bulkCreate([
      { title: 'Software Engineer' },
      { title: 'Marketing Specialist' },
      { title: 'Product Manager' },
    ]);

    const employees = await employee.bulkCreate([
      { name: 'Rahul Sharma', email: 'rahul.sharma@example.com' },
      { name: 'Priya Singh', email: 'priya.singh@example.com' },
      { name: 'Ankit Verma', email: 'ankit.verma@example.com' },
    ]);

    // Associate employees with departments and roles using create method on junction models
    await employeeDepartment.create({
      employeeId: employees[0].id,
      departmentId: departments[0].id,
    });
    await employeeRole.create({
      employeeId: employees[0].id,
      roleId: roles[0].id,
    });

    await employeeDepartment.create({
      employeeId: employees[1].id,
      departmentId: departments[1].id,
    });
    await employeeRole.create({
      employeeId: employees[1].id,
      roleId: roles[1].id,
    });

    await employeeDepartment.create({
      employeeId: employees[2].id,
      departmentId: departments[0].id,
    });
    await employeeRole.create({
      employeeId: employees[2].id,
      roleId: roles[2].id,
    });

    return res.status(200).json({ message: 'Database seeded!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// 1)Get all employees

const fetchAllEmployees = async () => {
  let employees = await employee.findAll();
  // return { employees };
  let detailedEmployees = [];
  for (let employee of employees) {
    // console.log(employee);
    let employeeDetails = await getEmployeeDetails(employee);
    detailedEmployees.push(employeeDetails);
  }
  return detailedEmployees;
};

app.get('/employees', async (req, res) => {
  try {
    const response = await fetchAllEmployees();
    if (response.length === 0) {
      return res.status(404).json({ message: 'No employees are found' });
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// 2. Get Employee by ID

const fetchEmployeeById = async (employeeId) => {
  let employeeById = await employee.findOne({ where: { id: employeeId } });
  let resultantEmployeeById = [];

  let employeeDetails = await getEmployeeDetails(employeeById);
  // console.log(employeeDetails);
  return employeeDetails;
};

app.get('/employees/details/:id', async (req, res) => {
  try {
    let id = req.params.id;
    let response = await fetchEmployeeById(id);
    if (response.length === 0) {
      return res
        .status(404)
        .json({ message: 'No such employee with a given id is found' });
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 3.Get Employees by Department
// (get all the employees from a particular department)

const getEmployeesbyDepartment = async (departmentId) => {
  const departmentEmployeesRecords = await employeeDepartment.findAll({
    where: { departmentId },
  });
  // console.log(departmentEmployeesRecords);
  // going to find the employess with the department ids
  let employees = [];
  for (let record of departmentEmployeesRecords) {
    // console.log(record);
    let employeeRecord = await employee.findOne({
      where: { id: record.employeeId },
    });
    if (employeeRecord) {
      let detailedEmployee = await getEmployeeDetails(employeeRecord);
      employees.push(detailedEmployee);
    }
  }
  return employees;
};

app.get('/employees/department/:id', async (req, res) => {
  try {
    let id = req.params.id;
    let response = await getEmployeesbyDepartment(id);
    if (response.length === 0) {
      return res.status(404).json({
        message: 'No employees are found for that particular department',
      });
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 4)Get all the employees by the role

const fetchAllEmployeesByRole = async (roleId) => {
  const employeeWithRoleRecords = await employeeRole.findAll({
    where: { roleId },
  });
  let employeeRecords = [];
  for (let emp of employeeWithRoleRecords) {
    let employeeRecord = await employee.findOne({
      where: { id: emp.employeeId },
    });
    if (employeeRecord) {
      let employeeDetails = await getEmployeeDetails(employeeRecord);
      employeeRecords.push(employeeDetails);
    }
  }
  return employeeRecords;
};

app.get('/employees/role/:roleId', async (req, res) => {
  try {
    let id = req.params.roleId;
    let response = await fetchAllEmployeesByRole(id);
    if (response.length === 0) {
      return res
        .status(404)
        .json({ message: 'No employees are found for that particular role' });
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// 5)Get Employees Sorted by Name
const sortEmployeesByName = async (order) => {
  let employeeRecord = await employee.findAll({
    order: [['name', order === 'desc' ? 'DESC' : 'ASC']],
  });

  let employeeRes = [];
  for (emp of employeeRecord) {
    let employeeCom = await getEmployeeDetails(emp);
    employeeRes.push(employeeCom);
  }
  return employeeRes;
};

app.get('/employees/sort-by-name', async (req, res) => {
  try {
    let order = req.query.order;
    let employees = await sortEmployeesByName(order);
    if (employees.length === 0) {
      return res
        .status(404)
        .json({ message: 'Employees were not found in the database' });
    }
    return res.status(200).json({ employees });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 5.Add a new employee

const createNewEmployee = async (newEmployee) => {
  const departmentData = await department.findOne({
    where: { id: newEmployee.departmentId },
  });
  // console.log(departmentData);

  const roleData = await role.findOne({
    where: { id: newEmployee.roleId },
  });

  const employeeCreate = await employee.create({
    name: newEmployee.name,
    email: newEmployee.email,
  });

  await employeeDepartment.create({
    employeeId: employeeCreate.id,
    departmentId: newEmployee.departmentId,
  });
  await employeeRole.create({
    employeeId: employeeCreate.id,
    roleId: newEmployee.roleId,
  });

  return await getEmployeeDetails(employeeCreate);
};

app.post('/employees/new', async (req, res) => {
  let employeeData = req.body; // Store request body in a variable
  console.log(employeeData);
  try {
    // Check if all required fields exist
    if (
      !employeeData.name ||
      !employeeData.email ||
      !employeeData.departmentId ||
      !employeeData.roleId
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let response = await createNewEmployee(employeeData);

    return res.status(201).json({ response });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 6.Update Employee Details
app.post('/employees/update/:id', async (req, res) => {
  const employeeId = req.params.id;
  const { name, email, departmentId, roleId } = req.body;

  try {
    // find the employee by id
    const employeeData = await employee.findOne({
      where: { id: employeeId },
    });
    if (!employeeData) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    if (name) {
      employeeData.name = name;
    }
    if (email) {
      employeeData.email = email;
    }
    await employeeData.save();

    //  If departmentId is provided, update the department
    if (departmentId) {
      await employeeDepartment.destroy({ where: { employeeId } }); // Remove existing association
      await employeeDepartment.create({ employeeId, departmentId }); // Add new association
    }

    //  If roleId is provided, update the role
    if (roleId) {
      await employeeRole.destroy({ where: { employeeId } }); // Remove existing association
      await employeeRole.create({ employeeId, roleId }); // Add new association
    }

    // fetching the employee details
    const updatedDetails = await getEmployeeDetails(employeeData);
    return res.status(200).json(updatedDetails);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// 7. Delete an employee
app.post('/employees/delete', async (req, res) => {
  const { id } = req.body; // Get employee ID from request body

  if (!id) {
    return res.status(400).json({ message: 'Employee ID is required' });
  }

  try {
    const employeeData = await employee.findOne({ where: { id } });

    if (!employeeData) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    await employeeDepartment.destroy({ where: { employeeId: id } });
    await employeeRole.destroy({ where: { employeeId: id } });

    await employee.destroy({ where: { id } });

    return res.status(200).json({
      message: `Employee with ID ${id} has been deleted.`,
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return res.status(500).json({ error: error.message });
  }
});
app.listen('3000', () => {
  console.log('Server is running on port 3000');
});
