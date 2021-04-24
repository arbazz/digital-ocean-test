const mongoose = require("mongoose");

const CustomOfferSchema = new mongoose.Schema({
        totalQuantity: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        firstname: {
            type: String,
            required: true
        },
        lastname: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        createdDate: {
            type: Date,
            default: Date.now,
        },
        patients: {
            type: Array
        },
        testType: {
            type: Array,
            required: true
        },
        promo: {
            type: String,
        }
    },
);

module.exports = CustomOffer = mongoose.model("CustomOffer", CustomOfferSchema , 'CustomOffer');

