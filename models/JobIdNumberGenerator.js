const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const JobIdNumberGeneratorSchema = new mongoose.Schema({
        jobId : String,
        value: Number
    }
);

module.exports = JobIdNumberGenerator = mongoose.model("jobidnumbergenerator", JobIdNumberGeneratorSchema , 'jobidnumbergenerator');
