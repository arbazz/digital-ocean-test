const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
        username: {
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
            requried: true,
        },
        status: {
            type: String,
            default: "Active",
        },
        type: {
            type: String,
            default: "Admin",
        },
        jobId:{
            type:String,
        },
        createdDate: {
            type: Date,
            default: Date.now,
        },
        locations: {
            type: [Schema.Types.ObjectId],
            ref: "location",
        },
        key:{
            type: String
        }
    },
);

module.exports = User = mongoose.model("user", UserSchema , 'user');

