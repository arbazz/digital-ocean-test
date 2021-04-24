const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EmployeeSchema = new mongoose.Schema({

        firstname: {
            type: String,
            required: true
        },
        lastname: {
            type: String,
            required: true
        },
        fullname: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String
        },
        state: {
            type: String
        },
        zipCode: {
            type: String
        },
        dateOfBirth: {
            type: Date,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        status: {
            type: String,
            default: "InActive",
        },
        type: {
            type: Schema.Types.ObjectId,
            ref: "employeeType",
        },
        location: {
            type: Schema.Types.ObjectId,
            ref: "location",
        },
        jobId: {
            type: String,
            required: true
        },
        createdDate: {
            type: Date,
            default: Date.now,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user"
        },
        key:{
            type: String
        },
        verificationCode:{
            type: String
        }
    },
);


module.exports = Employee = mongoose.model("employee", EmployeeSchema , 'employee');
