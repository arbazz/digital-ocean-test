const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RevenueSchema = new mongoose.Schema({
        patientId: {
            type: Schema.Types.ObjectId,
            ref: "patient",
        },
        price: {
            type: Number
        },
        createdDate: {
            type: Date,
            default: Date.now,
        },
    },
);

module.exports = Revenue = mongoose.model("revenue", RevenueSchema , 'revenue');
