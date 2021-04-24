const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const userController = require("../controllers/UserController");
const employeeController = require("../controllers/EmployeeController");
const employeeAttendanceController = require("../controllers/EmployeeAttendanceController");
const patientController = require("../controllers/PatientController");
const employeeTypeController = require("../controllers/TypeController");
const testTypeController = require("../controllers/TestTypeController");
const locationController = require("../controllers/LocationController");
const CustomOfferController = require("../controllers/CustomOfferController");
const jobIdController = require("../controllers/JobIdController");
const { check, validationResult, oneOf, body } = require("express-validator");
const multer = require('multer');
const fs = require('fs');
const path = require("path");

const { Dropbox } = require('dropbox'); // eslint-disable-line import/no-unresolved
var dbx = new Dropbox({ accessToken: "7lMPIuj-bzwAAAAAAAAAAY7lmFGKcMh07Sd9i2bfOkII8SmkM3nhfnDR4KXccI5u" });

const storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: function (req, file, cb) {
        cb(null, "IMAGE-" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
}).single("myImage");

/*
Patient API
*/
router.post('/addPatient', [
    check('testType').not().isEmpty().withMessage('Please select Exam Type'),
    check('firstname').not().isEmpty().withMessage('Please enter First name'),
    check('lastname').not().isEmpty().withMessage('Please enter Last name'),
    check('email', 'This is not a valid email').isEmail(),
    check('address').not().isEmpty().withMessage('Please enter Address'),
    check('city').not().isEmpty().withMessage('Please enter City'),
    check('state').not().isEmpty().withMessage('Please enter State'),
    check('zipCode').not().isEmpty().withMessage('Please enter ZipCode'),
    check('dateOfBirth').not().isEmpty().withMessage('Please enter Date OF Birth'),
    check('age').not().isEmpty().withMessage('Please enter Age'),
    check('phone').not().isEmpty().withMessage('Please enter Phone Number'),
], auth, patientController.createPatient);

router.post('/addPatientByLandingPage', [
    check('testType').not().isEmpty().withMessage('Please select Exam Type'),
    check('firstname').not().isEmpty().withMessage('Please enter First name'),
    check('lastname').not().isEmpty().withMessage('Please enter Last name'),
    check('email', 'This is not a valid email').isEmail(),
    check('address').not().isEmpty().withMessage('Please enter Address'),
    check('city').not().isEmpty().withMessage('Please enter City'),
    check('state').not().isEmpty().withMessage('Please enter State'),
    check('zipCode').not().isEmpty().withMessage('Please enter ZipCode'),
    check('dateOfBirth').not().isEmpty().withMessage('Please enter Date OF Birth'),
    check('age').not().isEmpty().withMessage('Please enter Age'),
    check('phone').not().isEmpty().withMessage('Please enter Phone Number'),
], patientController.createPatientByLandingPage);

router.post('/updatePatient', [
    check('firstname').not().isEmpty().withMessage('Please enter First name'),
    check('lastname').not().isEmpty().withMessage('Please enter Last name'),
    check('email', 'This is not a valid email').isEmail(),
    check('address').not().isEmpty().withMessage('Please enter Address'),
    check('city').not().isEmpty().withMessage('Please enter City'),
    check('state').not().isEmpty().withMessage('Please enter State'),
    check('zipCode').not().isEmpty().withMessage('Please enter ZipCode'),
    check('dateOfBirth').not().isEmpty().withMessage('Please enter Date OF Birth'),
    check('age').not().isEmpty().withMessage('Please enter Age'),
    check('phone').not().isEmpty().withMessage('Please enter Phone Number'),
    check('deliveryMethod').not().isEmpty().withMessage('Please select delivery method'),
], auth, patientController.updatePatient);

router.get('/getPatientById/:id', auth, patientController.getPatientById);
router.post('/searchPatient', auth, patientController.searchPatient);
router.post('/searchPatientByLandingPage', patientController.searchPatientByLandingPage);
router.get('/removePatient/:id', auth, patientController.removePatient);
router.post('/updatePatientWithTested', auth, patientController.updatePatientWithTested);
router.get('/getAllNewestUntestedPatients', auth, patientController.getAllNewestUntestedPatients);
router.get('/getAllNewestTestedPatients', auth, patientController.getAllNewestTestedPatients);
router.get('/getAllOldestUntestedPatients', auth, patientController.getAllOldestUntestedPatients);
router.get('/getAllOldestTestedPatients', auth, patientController.getAllOldestTestedPatients);
router.post('/updateRapidTestPatientResults', auth, patientController.updateRapidTestPatientResults);


// used by lab technician panel
router.post('/updatePatientResults', patientController.updatePatientResults);
router.post('/updateConcessionNumber', auth, patientController.updateConcessionNumber);
router.get('/getAllConcessionNumberPatients', auth, patientController.getAllConcessionNumberPatients);
router.post('/searchPatientByDate', auth, patientController.searchPatientByDate);
router.post('/searchPatientLab', auth, patientController.searchPatientLab);
router.post('/updatePatientEmailOrPhone', patientController.updatePatientEmailOrPhone);


/*
Employee API
*/
router.post('/register', [
    check('firstname').not().isEmpty().withMessage('Please enter first name'),
    check('lastname').not().isEmpty().withMessage('Please enter Last name'),
    check('address').not().isEmpty().withMessage('Please enter address'),
    check('city').not().isEmpty().withMessage('Please enter City'),
    check('state').not().isEmpty().withMessage('Please enter State'),
    check('zipCode').not().isEmpty().withMessage('Please enter ZipCode'),
    check('dateOfBirth').not().isEmpty().withMessage('Please enter Date OF Birth'),
    check('phone').not().isEmpty().withMessage('Please enter Phone Number'),
    check('jobId').not().isEmpty().withMessage('Please select job Id'),
    check('type').not().isEmpty().withMessage('Please select job type'),
    check('location').not().isEmpty().withMessage('Please select location'),
    check('email', 'This is not a valid email').isEmail(),
    check('password', 'Your password must be at least 6 characters long').not().isEmpty(),
], employeeController.createEmployee);
router.post('/login', employeeController.login);
router.post('/forgotPassword', employeeController.forgotPassword);
router.post('/forgotPasswordViaText', employeeController.forgotPasswordViaText);
router.post('/checkVerificationCode', employeeController.checkVerificationCode);
router.post('/changePasswordViaText', employeeController.changePasswordViaText);
router.post('/changePassword/:id/:key', employeeController.changePassword);
router.get('/activateEmployee/:id', employeeController.activateEmployee);
router.get('/profile/:id', auth, employeeController.getProfile);

// time log API
router.post('/checkIn', employeeAttendanceController.checkIn);
router.post('/checkOut', employeeAttendanceController.checkOut);
router.post('/breakIn', employeeAttendanceController.breakIn);
router.post('/breakOut', employeeAttendanceController.breakOut);
router.post('/getMonthlyAttendance', employeeAttendanceController.getMonthlyAttendance);
router.get('/getTodayAttendance/:id', employeeAttendanceController.getTodayAttendance);

/*
TestType API
*/
router.get('/getAllTestType', testTypeController.getAll);
router.post('/addTestType', testTypeController.create);

/*
JobId API
*/
router.get('/getAllJobId', jobIdController.getAll);


/*
EmployeeType API
*/
router.get('/getAllEmployeeType', employeeTypeController.getAll);
router.post('/addEmployeeType', employeeTypeController.create);

/*
Location API
*/
router.get('/getAllLocation', locationController.getAll);
router.post('/getLocationByJodId', locationController.getLocationByJodId);
router.post('/addLocation', locationController.create);

//generateNumber API for Testing
router.post('/generateNumber', locationController.generateNumber);
router.get('/getGeneratedNumber', locationController.getGeneratedNumber);
router.get('/generatedNumberJobID', locationController.generatedNumberJobID);
router.get('/downloadFile', patientController.downloadFile);

// Custom Offer api

router.get('/getAllCustomOffer', CustomOfferController.getAll);
router.post('/addOffer', CustomOfferController.AddOffer);
router.post('/verifyIdCustom', CustomOfferController.verifyId);
router.post('/addCustomOfferPateint', CustomOfferController.addPatient);
router.post('/getById', CustomOfferController.getById);

// user or admin controller
router.post('/addAdmin', userController.createUser);
router.post('/deleteAdmin', userController.deleteUser);


// Image Upload API
router.post('/image', function (req, res) {
    upload(req, res, (err) => {
        const f = req.file && req.file.filename;
        let filename = f;
        let ext;
        if (filename) ext = path.extname(filename);
        if (!ext) {
            filename = filename + '.pdf';
        }
        let filePath = req.file && req.file.path;
        console.log(req.file)
        if (!filePath) {
            console.log("no file path")
            return res.send("error").end()
        }
        fs.readFile(filePath, function read(err, data) {
            if (err) {
                console.log(err);
            }
            content = data;
            // console.log("ceon",content);

            if (!err && filename != undefined && content) {
                dbx.filesUpload({ path: '/' + filename, contents: content })
                    .then(function (response) {
                        // console.log(response.result);
                        dbx.sharingCreateSharedLinkWithSettings({
                            path: response.result.path_display,
                            "settings": {
                                "requested_visibility": "public",
                                "audience": "public",
                                "access": "viewer",
                            }
                        }).then((e) => {
                            return res.send(e).end();
                        }).catch((err) => {
                            console.log(err);
                            return res.send("error").end()
                        })
                    })
                    .catch(function (error) {
                        console.error(error);
                    });
            } else {
                console.log("error")
            }
        });
        // return
        /*Now do where ever you want to do*/
    });
});

const stripe = require("stripe")("sk_test_2a42hPhf1hAd707nA1wjdKCk00w6VoVBBt");


router.post("/payment", async (req, res) => {
    let { amount, id, des } = req.body;
    try {
        const payment = await stripe.paymentIntents.create({
            amount,
            currency: "USD",
            description: des,
            payment_method: id,
            confirm: true
        });
        console.log("Payment", payment.charges?.data[0].id);
        res.json({
            message: "Payment successful",
            success: true,
            payment
        });
    } catch (error) {
        console.log("Error", error.message);
        res.json({
            message: error.message ? error.message : 'Payment Failed',
            success: false
        });
    }
});


router.post("/cancelPayment", async (req, res) => {
    let { id } = req.body;
    try {
        const paymentIntent =await stripe.refunds.create(
            {charge:id}
        );
        console.log(paymentIntent);
        res.json({
            paymentIntent,
        });
    } catch (error) {
        console.log("Error", error.message);
        res.json({
            message: error.message ? error.message : 'Payment Failed',
            code: error.code,
            success: false
        });
    }
});


module.exports = router;




//     check('sex').not().isEmpty().withMessage('Please select Sex'),
//     check('ssn').not().isEmpty().withMessage('Please enter SSN'),
//     check('ssn').custom((val) => /^(?!(000|666|9))\d{3}-(?!00)\d{2}-(?!0000)\d{4}$/.test(val)).withMessage('SSN format is incorrect'),
//     check('deliveryMethod').not().isEmpty().withMessage('Please select delivery method'),
//     check('identityCard').not().isEmpty().withMessage('Please attach ID'),
//     check('isInsured').exists().withMessage('Please select Insurance'),