  // Admin Panel Routes
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const employeeController = require("../controllers/EmployeeController");
const patientController = require("../controllers/PatientController");
const employeeTypeController = require("../controllers/TypeController");
const locationController = require("../controllers/LocationController");
const revenueController = require("../controllers/RevenueController");
const employeeAttendanceController = require("../controllers/EmployeeAttendanceController");
const userController = require("../controllers/UserController");


/*
Admin User API
*/
router.post('/create',userController.createUser);
router.post('/login',userController.login);
router.post('/forgotPassword',userController.forgotPassword);
router.post('/changePassword/:id/:key',userController.changePassword);
router.get('/getAllUsers',auth,userController.getAllUsers);
router.get('/getUser/:id',auth,userController.getUserById);
router.post('/updateUser/:id',auth,userController.updateUser);
router.get('/deleteUser/:id',auth,userController.deleteUser);


/*
Overview  API for Super Admin
*/
router.get('/getAllTestedPatientNumbers',auth,patientController.getAllTestedPatientNumbers);
router.post('/getAllTestedPatientsByMonthDate',auth,patientController.getAllTestedPatientsByMonthDate);
router.post('/getTotalTestedPatientsOfLocationByDate',auth,patientController.getTotalTestedPatientsOfLocationByDate);

/*
Overview  API for Admin Only
*/
router.get('/getAllTestedPatientNumbersRelatedToJobId',auth,patientController.getAllTestedPatientNumbersRelatedToJobId);
router.post('/getAllTestedPatientsByMonthDateRelatedToJobId',auth,patientController.getAllTestedPatientsByMonthDateRelatedToJobId);
router.post('/getTotalTestedPatientsOfLocationByDateRelatedToJobId',auth,patientController.getTotalTestedPatientsOfLocationByDateRelatedToJobId);


/*
 Analytics API for Super Admin
*/
router.post('/getAllTestedPatientsOfAllLocationsByDateRange',auth,patientController.getAllTestedPatientsOfAllLocationsByDateRange);
router.post('/getAllTestedPatientsOfLocationByDateRange',auth,patientController.getAllTestedPatientsOfLocationByDateRange);

/*
Analytics API for Admin
*/
router.post('/getAllTestedPatientsOfAllLocationsByDateRangeRelatedToJobId',auth,patientController.getAllTestedPatientsOfAllLocationsByDateRangeRelatedToJobId);
router.post('/getAllTestedPatientsOfLocationByDateRangeRelatedToJobId',auth,patientController.getAllTestedPatientsOfLocationByDateRangeRelatedToJobId);


/*
Employee API
*/
router.get('/getAllEmployees',auth,employeeController.getAllEmployees);
router.post('/updateEmployee',auth,employeeController.updateEmployee);
router.post('/updateLocation',auth,employeeController.updateLocation);
router.get('/removeEmployee/:id',auth,employeeController.removeEmployee);
router.get('/activateEmployee/:id',auth,employeeController.activateEmployee);
router.get('/deactivateEmployee/:id',auth,employeeController.deActivateEmployee);

/*
Revenue  API
*/
router.get('/getTotalRevenue',auth,revenueController.getTotalRevenue);
router.get('/getMonthlyRevenue',auth,revenueController.getMonthlyRevenue);

/*
Employee Performance and hours  API
*/
router.post('/getEmployeeHours',auth,employeeAttendanceController.getEmployeeHours);
router.post('/getEmployeePerformance',auth,employeeAttendanceController.getEmployeePerformance);


module.exports = router;