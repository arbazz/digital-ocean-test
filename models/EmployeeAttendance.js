const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EmployeeAttendanceSchema = new mongoose.Schema({
        employeeId: {
            type: Schema.Types.ObjectId,
            ref: "employee",
        },
        checkInDate: {
            type: Date
        },
        checkOutDate: {
            type: Date
        },
        breakInDate:[ {type:Date} ],

        breakOutDate:[ {type:Date} ],

        breakHours: {
            type: Number
        },
        totalHours: {
            type: Number
        },
        createdDate: {
            type: Date,
            default: Date.now,
        },
        status:{
            type:String
        }





    },
);

module.exports = Employee = mongoose.model("employeeattendance", EmployeeAttendanceSchema , 'employeeattendance');
