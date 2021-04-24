const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const JobIdSchema = new mongoose.Schema({
        value: {
            type: String,
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        status: {
            type: String,
            default: "Active",
        },
        createdDate: {
            type: Date,
            default: Date.now,
        }
    },
);

module.exports = JobId = mongoose.model("jobid", JobIdSchema , 'jobid');

