const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TypeSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        time: {
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

module.exports = TestType = mongoose.model("testtype", TypeSchema , 'testtype');

