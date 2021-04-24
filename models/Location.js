const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LocationSchema = new mongoose.Schema({
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

module.exports = Location = mongoose.model("location", LocationSchema , 'location');
