const EmployeeModel = require("../models/Employee");
const UserModel = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const CONSTANT = require("../config/constants");
const secretKey = CONSTANT.jwtSecret;
const helper = require("../helpers/helperService");
const { check, validationResult } = require("express-validator");


const employeeController = {

    createEmployee: async (request, response) => {

        console.log("====== Employee Create API =======");
        console.log("=== Body Params: ===" + (JSON.stringify(request.body)));

        const body = JSON.parse(JSON.stringify(request.body));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response
                .status(422)
                .json({ errors: errors.array() });
        }
        try {
            // check if there is any record with same email
            const userByEmail = await EmployeeModel.findOne({ email: body.email });
            if (userByEmail) {
                return response
                    .status(422)
                    .json({ errors: [{ msg: "Employee with this Email already exists" }] });
            }

            const userAdmin = await UserModel.findOne({ jobId: body.jobId });
            console.log(userAdmin);
            // save user record
            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash(body.password, salt);

            let userBody;
            userBody = {
                firstname: body.firstname,
                lastname: body.lastname,
                fullname: body.firstname + ' ' + body.lastname,
                email: body.email,
                password: password,
                type: body.type,
                location: body.location,
                phone: body.phone,
                address: body.address,
                city: body.city,
                state: body.state,
                zipCode: body.zipCode,
                dateOfBirth: body.dateOfBirth,
                jobId: body.jobId,
                createdBy: userAdmin._id
            };

            let employee = new EmployeeModel(userBody);
            await employee.save();
            await helper.awaitingAdminApprovalEmail(employee);

            response
                .status(200)
                .json({ employee, msg: "You have successfully signed up. You will receive an email shortly once your account is approved." });
        }
        catch (err) {
            console.log(err);
            response
                .status(500)
                .json({ errors: { msg: err } });
        }
    },

    login: async (request, response) => {

        console.log("====== Employee Login API =======");
        console.log("=== Body Params: ===" + JSON.parse(JSON.stringify(request.body)));

        const { email, password } = request.body;

        try {
            // check for existing user
            let user = await EmployeeModel.findOne({ email });
            if (!user) {
                return response
                    .status(400)
                    .json({ errors: { msg: "Email does not exists" } });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return response
                    .status(400)
                    .json({ errors: { msg: "Invalid Password" } });
            }

            if (user.status == "Active") {
                const payload = {
                    user: {
                        id: user.id,
                    },
                };
                console.log("user obj is ");
                console.log(user);
                jwt.sign(
                    payload,
                    secretKey,
                    { expiresIn: '7d' },
                    (err, token) => {
                        console.log("token is");
                        console.log(token);
                        if (err) throw err;
                        response
                            .status(200)
                            .json({ token, user: user });
                    });
            }
            else {
                return response
                    .status(400)
                    .json({ errors: { msg: "This account is not activated. Wait for the admin to approve your account" } });
            }
        }
        catch (err) {
            console.log(err);
            return response
                .status(500)
                .json({ errors: { msg: "Server error" } });
        }

    },

    activateEmployee: async (request, response) => {

        console.log("====== User Activation API =======");
        console.log("====== Request Params  ======" + request.params);

        try {
            let user = await EmployeeModel.findById(request.params.id).exec();
            if (user) {
                // update user active key
                await EmployeeModel.updateOne({ "_id": request.params.id }, {
                    $set: {
                        "status": "Active"
                    }
                });
                // send activation email
                await helper.activationEmail(user, request.headers.host);
                response
                    .status(200)
                    .json({ msg: "Employee account has activated" });
            }
            else {
                return response
                    .status(400)
                    .json({ errors: { msg: "No user found with this id" } });
            }
        }
        catch (err) {
            console.log(err);
            response
                .status(500)
                .json({ errors: { msg: err } });
        }
    },

    deActivateEmployee: async (request, response) => {

        console.log("====== User DeActivation API =======");
        console.log("====== Request Params  ======" + request.params);

        try {
            let user = await EmployeeModel.findById(request.params.id).exec();
            if (user) {
                // update user active key
                await EmployeeModel.updateOne({ "_id": request.params.id }, {
                    $set: {
                        "status": "InActive"
                    }
                });

                response
                    .status(200)
                    .json({ msg: "Employee account has deActivated" });
            }
            else {
                return response
                    .status(400)
                    .json({ errors: { msg: "No employee found with this id" } });
            }
        }
        catch (err) {
            console.log(err);
            response
                .status(500)
                .json({ errors: { msg: err } });
        }
    },

    forgotPassword: async (request, response) => {

        console.log("======  Forgot Password API =======");
        console.log("=== Body Params: ===" + (JSON.stringify(request.body)));

        try {
            const body = JSON.parse(JSON.stringify(request.body));
            let user = await EmployeeModel.findOne({ email: body.email });
            if (user) {
                // send email
                const key = new Date().getTime();

                await EmployeeModel.updateOne({ "_id": user._id }, {
                    $set: {
                        "key": key
                    }
                });
                const server = CONSTANT.domainUrl;

                await helper.forgotPassword(user, server, key);
                response
                    .status(200)
                    .json({ msg: "You will received email shortly" });
            }
            else {
                response
                    .status(400)
                    .json({ msg: "Invalid email address" });
            }
        }
        catch (err) {
            console.log(err);
            response
                .status(500)
                .json({ msg: err });
        }
    },

    forgotPasswordViaText: async (request, response) => {

        console.log("======  Forgot Password Via Text API =======");
        console.log("=== Body Params: ===" + (JSON.stringify(request.body)));

        try {
            const body = JSON.parse(JSON.stringify(request.body));
            let user = await EmployeeModel.findOne({ phone: body.phone });
            if (user) {
                // send text
                let key = new Date().getTime();
                let code = key;
                console.log("new code==>",code);
                code = (code + "").padStart(4, "0");
                code = code.substr(9)
                console.log("code==>",code);
                await EmployeeModel.updateOne({ "_id": user._id }, {
                    $set: {
                        "verificationCode" : code ,  "key": key
                    }
                });

                await helper.sendCodeViaText(user.phone, code);

                response
                    .status(200)
                    .json({ userId: user._id  , code:code ,msg: "Verification code is sent" });
            }
            else {
                response
                    .status(400)
                    .json({ msg: "Invalid phone number" });
            }
        }
        catch (err) {
            console.log(err);
            response
                .status(500)
                .json({ msg: err });
        }
    },

    checkVerificationCode: async (request, response) => {

        console.log("======  check Verification Code API =======");
        console.log("=== Body Params: ===" + (JSON.stringify(request.body)));

        try {
            const body = JSON.parse(JSON.stringify(request.body));

            // check code in db
            let user = await EmployeeModel.findOne({ _id: body.id });

            if (user) {
                if (user.verificationCode == body.code) {
                    // check logic
                    let NowDate = new Date().getTime();
                    let textDate = user.key;
                    let diff = (NowDate - textDate) / 1000;
                    diff /= (60 * 60);
                    if (diff > 2) {
                        console.log("Code has expired");
                        response
                            .status(400)
                            .json({ msg: "Invalid request or verification code has expired" });
                    }
                    else {
                        response
                            .status(200)
                            .json({ userId: user._id , code:user.verificationCode , msg: "Verification Code is valid" });
                    }
                }
                else {
                    console.log("code has expired");
                    response
                        .status(400)
                        .json({ msg: "Invalid request or verification code has expired" });
                }
            }
            else {
                console.log("invalid user || user id not found");
                response
                    .status(400)
                    .json({ msg: "Invalid Code" });
            }

        }
        catch (err) {
            console.log(err);
            response
                .status(500)
                .json({ msg: err });
        }

    },

    changePasswordViaText: async (request, response) => {

        console.log("======  Change Password Via Text API =======");
        console.log("=== Body Params: ===" + (JSON.stringify(request.body)));

        try {
            const body = JSON.parse(JSON.stringify(request.body));
            if (body.password && body.code && body.id) {

                // check code in db
                let user = await EmployeeModel.findOne({ _id: body.id });

                if (user) {
                    if (user.verificationCode == body.code) {
                        // check logic
                        const salt = await bcrypt.genSalt(10);
                        const password = await bcrypt.hash(body.password, salt);
                        let NowDate = new Date().getTime();
                        let textDate = user.key;
                        let diff = (NowDate - textDate) / 1000;
                        diff /= (60 * 60);
                        if (diff > 2) {
                            console.log("Code has expired");
                            response
                                .status(400)
                                .json({ msg: "Invalid request or verification code has expired" });
                        }
                        else {
                            // update password
                            await EmployeeModel.updateOne({ "_id": body.id }, {
                                $set: {
                                    "password": password, key: '', verificationCode:''
                                }
                            });
                            response
                                .status(200)
                                .json({ msg: "Password has changed successfully" });
                        }
                    }
                    else {
                        console.log("code has expired");
                        response
                            .status(400)
                            .json({ msg: "Invalid request or verification code has expired" });
                    }
                }
                else {
                    console.log("invalid user || user id not found");
                    response
                        .status(400)
                        .json({ msg: "Invalid request" });
                }
            }
            else{
                console.log("parameters are missing");
                response
                    .status(500)
                    .json({ errors: { msg: "parameters are missing" } });
            }
        }
        catch (err) {
            console.log(err);
            response
                .status(500)
                .json({ msg: err });
        }
    },

    changePassword: async (request, response) => {

        console.log("======  Forgot Password API =======");
        // console.log("=== Body Params: ===" + (JSON.stringify(request.body)));

        try {
            const body = JSON.parse(JSON.stringify(request.body));
            if (body.password == body.confirm_password) {

                // check key in db
                let user = await EmployeeModel.findOne({ _id: request.params.id });

                if (user) {
                    if (user.key == request.params.key) {
                        // check logic
                        const salt = await bcrypt.genSalt(10);
                        const password = await bcrypt.hash(body.password, salt);
                        let NowDate = new Date().getTime();
                        let linkDate = request.params.key;
                        let diff = (NowDate - linkDate) / 1000;
                        diff /= (60 * 60);
                        if (diff > 2) {
                            console.log("Link has expired");
                            response
                                .status(400)
                                .json({ msg: "Invalid request or link has expired" });
                        }
                        else {
                            // update password
                            await EmployeeModel.updateOne({ "_id": request.params.id }, {
                                $set: {
                                    "password": password, key: ''
                                }
                            });
                            response
                                .status(200)
                                .json({ msg: "Password has changed successfully" });
                        }
                    }
                    else {
                        console.log("Link has expired");
                        response
                            .status(400)
                            .json({ msg: "Invalid request or link has expired" });
                    }
                }
                else {
                    console.log("invalid user || user id not found");
                    response
                        .status(400)
                        .json({ msg: "Invalid request" });
                }
            }
        }
        catch (err) {
            console.log(err);
            response
                .status(500)
                .json({ msg: err });
        }

    },

    getProfile: async (request, response) => {

        console.log("====== Get Employee Profile  API =======");
        console.log("=== Request Params: ===" + JSON.parse(JSON.stringify(request.params)));

        try {
            let user = await EmployeeModel.findOne({ "_id": request.params.id }).populate('EmployeeType').populate('Location').exec();

            if (user) {
                return response
                    .status(200)
                    .json({ user, msg: "Employee Found Successfully" });
            }
            else {
                return response
                    .status(200)
                    .json({ msg: "No Employee Found" });
            }

        } catch (err) {
            console.log(err);
            response.status(500).send("Server error");
        }

    },

    getAllEmployees: async (request, response) => {

        console.log(request.user);
        console.log("====== GEt All Employees  API =======");
        console.log("===== Query Params: =====");

        const { query } = request;
        const { skip, limit } = query;

        console.log(query);
        console.log("skip : " + skip + "and limit : " + limit);

        try {
            let user = await UserModel.findById(request.user.id);
            console.log("Admin Type is ====== " + user.type);
            console.log("Admin Id is ====== " + user._id);
            if (user.type == "Super Admin") {
                let employees = await EmployeeModel.find().sort({ createdDate: -1 }).skip(Number(skip)).limit(Number(limit)).exec();
                return response
                    .status(200)
                    .json({ employees, msg: "Employees found successfully" });
            }
            else {
                let employees = await EmployeeModel.find({ type: { $ne: '602217d598d003000450cf55' }, createdBy: user._id }).sort({ createdDate: -1 }).skip(Number(skip)).limit(Number(limit)).exec();
                return response
                    .status(200)
                    .json({ employees, msg: "Employees found successfully" });
            }
        } catch (err) {
            response
                .status(500)
                .json({ errors: { msg: err } });
        }

    },

    updateLocation: async (request, response) => {
        console.log("===== Update locaiont ====");
        console.log("=== Body Params: ===" + (JSON.stringify(request.body)));
        const body = JSON.parse(JSON.stringify(request.body));
        if (body.location) {
            try {
                let uBody = {
                    location: body.location
                }
                let employee = await EmployeeModel.findOneAndUpdate({ _id: body.employeeId }, { $set: uBody }, { new: true });
                response
                    .status(200)
                    .json({ employee, msg: "Employee record updated successfully." });
            } catch (err) {
                console.log(err);
                response
                    .status(500)
                    .json({ errors: { msg: err } });
            }
        } else {
            console.log("parameters are missing");
            response
                .status(500)
                .json({ errors: { msg: "parameters are missing" } });
        }
    },

    updateEmployee: async (request, response) => {

        console.log("====== EmployeeModel Update API =======");
        console.log("=== Body Params: ===" + (JSON.stringify(request.body)));
        
        const body = JSON.parse(JSON.stringify(request.body));

        // check if all params are present
        if (body.employeeId && body.firstname && body.lastname && body.email && body.address && body.phone && body.dateOfBirth && body.type && body.location) {

            try {
                const userByEmail = await EmployeeModel.findOne({ _id: { $ne: body.employeeId }, email: body.email });
                if (userByEmail) {
                    return response
                        .status(422)
                        .json({ errors: { msg: "Employee with this Email already exists" } });
                }

                let userBody = {
                    firstname: body.firstname,
                    lastname: body.lastname,
                    fullname: body.firstname + ' ' + body.lastname,
                    email: body.email,
                    type: body.type,
                    location: body.location,
                    phone: body.phone,
                    address: body.address,
                    apartment: body.apartment,
                    city: body.city,
                    state: body.state,
                    zipCode: body.zipCode,
                    dateOfBirth: body.dateOfBirth
                };

                let employee = await EmployeeModel.findOneAndUpdate({ _id: body.employeeId }, { $set: userBody }, { new: true });

                response
                    .status(200)
                    .json({ employee, msg: "Employee record updated successfully." });
            }
            catch (err) {
                console.log(err);
                response
                    .status(500)
                    .json({ errors: { msg: err } });
            }
        }
        else {
            console.log("parameters are missing");
            response
                .status(422)
                .json({ errors: { msg: "parameters are missing" } });
        }
    },

    removeEmployee: async (request, response) => {

        console.log("====== Remove Employee API =======");

        try {
            const employee = await EmployeeModel.findById(request.params.id);

            if (!employee) {
                return response
                    .status(400)
                    .json({ msg: "No employee found" });
            }
            else {
                await employee.remove();
                response
                    .status(200)
                    .json({ msg: "Employee Removed Successfully" });
            }
        } catch (err) {
            console.log(err);
            response
                .status(500)
                .json({ errors: { msg: err } });
        }
    }

}

module.exports = employeeController;
