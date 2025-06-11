const express = require('express');
const router = express.Router();
const DepartmentController = require('../controllers/departmentController');

router.post('/departments', DepartmentController.createDepartment);
router.get('/departments', DepartmentController.getAllDepartments);

module.exports = router;