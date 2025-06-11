const Department = require('../models/Department');

class DepartmentController {
  static async createDepartment(req, res) {
    try {
      const department = await Department.create(req.body);
      res.json({
        success: true,
        department
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating department',
        error: error.message
      });
    }
  }

  static async getAllDepartments(req, res) {
    try {
      const departments = await Department.getAll();
      res.json({
        success: true,
        departments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching departments',
        error: error.message
      });
    }
  }
}

module.exports = DepartmentController;