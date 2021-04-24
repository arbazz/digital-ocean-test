const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TypeSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        status: {
            type: String,
            default: "Active",
        },
        createdDate: {
            type: Date,
            default: Date.now,
        },
    },
);

module.exports = EmployeeType = mongoose.model("employeeType", TypeSchema , 'employeeType');

