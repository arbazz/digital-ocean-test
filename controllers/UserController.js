const UserModel = require("../models/User");
const JobIdModel = require("../models/JobId");
const JobIdNumberGeneratorModel = require("../models/JobIdNumberGenerator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const CONSTANT = require("../config/constants");
const helper = require("../helpers/helperService");
const { Mongoose } = require("mongoose");
const { ObjectId } = require("bson");
const secretKey = CONSTANT.jwtSecret;


const userController = {

    createUser: async (request, response) => {

        console.log("====== Admin User Create API =======");
        console.log("=== Body Params: ===" + (JSON.stringify(request.body)));

        const body = JSON.parse(JSON.stringify(request.body));
        try {

            // check if there is any record with same email
            const userByEmail = await UserModel.findOne({ email: body.email });
            if (userByEmail) {
                return response
                    .status(422)
                    .json({ errors: [{ msg: "User with this Email already exists" }] });
            }

            const userByUsername = await UserModel.findOne({ username: body.username });
            if (userByUsername) {
                return response
                    .status(422)
                    .json({ errors: [{ msg: "User with this Username already exists" }] });
            }

            // save user record

            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash(body.password, salt);
            let userBody;

            console.log("User Type is " + body.type);

            if (body.type == "Admin") {
              
                let numberDoc = await JobIdNumberGeneratorModel.findOneAndUpdate({ "jobId": "jobId" }, { "$inc": { "value": 1 } }, { new: true });
                let value = numberDoc.value;
                let jobId = (value + '').padStart(3, '0');
                console.log("jobId ===== " + jobId);

                userBody = {
                    username: body.username,
                    fullname: body.fullname,
                    email: body.email,
                    password: password,
                    type: body.type,
                    jobId: jobId,
                    locations: body.location
                };

                let user = new UserModel(userBody);
                user.markModified('location');

                user = await user.save();
                
                console.log("save user is ");
                console.log(user);

                let data = {
                    user: user._id,
                    value: jobId
                }

                data = new JobIdModel(data);
                data = await data.save();
                console.log("save jobId is");
                console.log(data);
                response
                    .status(200)
                    .json({ user, msg: "Admin User Created Successfully" });
            }
            else {
                userBody = {
                    username: body.username,
                    fullname: body.fullname,
                    email: body.email,
                    password: password,
                    type: body.type
                };

                let user = new UserModel(userBody);
                user = await user.save();
                console.log("save user is ");
                console.log(user);
                response
                    .status(200)
                    .json({ user, msg: "Admin User Created Successfully" });
            }
        }
        catch (err) {
            console.log(err);
            response
                .status(500)
                .json({ errors: { msg: err } });
        }
    },

    login: async (request, response) => {

        console.log("====== Admin User Login API =======");
        console.log("=== Body Params: ===" + JSON.parse(JSON.stringify(request.body)));

        const body = JSON.parse(JSON.stringify(request.body));
        const { username, password } = request.body;


        try {
            // check for existing user
            let user = await UserModel.findOne({ username: { $regex: username, $options: 'i' } });

            if (!user) {
                return response
                    .status(400)
                    .json({ errors: { msg: "Username does not exists" } });
            }
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return response
                    .status(400)
                    .json({ errors: { msg: "Invalid Password" } });
            }

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
                }
            );
        } catch (err) {
            console.log(err);
            response
                .status(500)
                .json({ errors: { msg: err } });
        }

    },

    forgotPassword: async (request, response) => {

        console.log("======  Forgot Password API =======");

        try {
            const body = JSON.parse(JSON.stringify(request.body));
            let user = await UserModel.findOne({ email: body.email });
            if (user) {
                // send email
                const key = new Date().getTime();

                await UserModel.updateOne({ "_id": user._id }, {
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

    changePassword: async (request, response) => {

        console.log("======  Forgot Password API =======");
        // console.log("=== Body Params: ===" + (JSON.stringify(request.body)));

        try {
            const body = JSON.parse(JSON.stringify(request.body));
            if (body.password == body.confirm_password) {

                // check key in db
                let user = await UserModel.findOne({ _id: request.params.id });

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
                            await UserModel.updateOne({ "_id": request.params.id }, {
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

    getAllUsers: async (request, response) => {

        console.log("====== User Get All API =======");

        try {
            let user = await UserModel.find();
            if (user.length) {
                return response
                    .status(200)
                    .json({ user, msg: "Users Found Successfully" });
            }
            else {
                return response
                    .status(200)
                    .json({ msg: "No User Found" });
            }

        } catch (err) {
            console.log(err);
            response.status(500).send("Server error");
        }

    },

    getUserById: async (request, response) => {

        console.log("====== Get User By Id  API =======");
        console.log("=== Request Params: ===" + JSON.parse(JSON.stringify(request.params)));

        try {
            const id = request.params.id;
            let user = await UserModel.findById(id);

            if (user) {
                return response
                    .status(200)
                    .json({ user, msg: "User Found Successfully" });
            }
            else {
                return response
                    .status(200)
                    .json({ msg: "No User Found" });
            }

        } catch (err) {
            console.log(err);
            response.status(500).send("Server error");
        }

    },

    updateUser: async (request, response) => {

        console.log("====== User Update API =======");
        console.log("=== Request Params: ===" + request.params.id);
        console.log("=== Body Params: ===" + (JSON.stringify(request.body)));

        const { body } = request;
        const id = request.params.id;

        try {

            let user = await UserModel.findById(id);

            // validate
            if (!user) {
                return response
                    .status(422)
                    .json({ errors: [{ msg: "No User Found" }] });
            }
            // else{
            //     // check if there is any record with same email or username
            //
            //     if (user.username !== body.username) {
            //         return response
            //                 .status(422)
            //                 .json({errors: [{msg:"User with this Username already exists"} ]});
            //     }
            //     if (user.email !== body.email) {
            //         return response
            //             .status(422)
            //             .json({errors: [{msg:"User with this email already exists"} ]});
            //     }
            // }

            if (body.password) {
                const salt = await bcrypt.genSalt(10);
                body.password = await bcrypt.hash(body.password, salt);
            }

            // copy BodyParams properties to user
            Object.assign(user, body);

            user = new UserModel(user);
            console.log(user);

            let doc = await UserModel.findOneAndUpdate({ _id: id }, user, {
                new: true
            });

            return response
                .status(200)
                .json({ doc, msg: "User Updated Successfully" });

        }
        catch (err) {
            console.log(err);
            response
                .status(500)
                .json({ msg: err });
        }
    },

    deleteUser: async (request, response) => {

        console.log("====== Delete User By Id  API =======");
        console.log("=== Request Params: ===" + JSON.parse(JSON.stringify(request.params)));

        try {
            const id = request.params.id;
            console.log(id);
            await UserModel.findByIdAndRemove(id);
            const res = await JobIdModel.deleteOne( { "user" : id } );
            console.log(res);
            return response
                .status(200)
                .json({ user: userController, msg: "User Deleted Successfully" });

        } catch (err) {
            console.log(err);
            response.status(500).send("Server error");
        }

    }

}

module.exports = userController;

