const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NumberGeneratorSchema = new mongoose.Schema({
        name : String,
        value: Number
    }
);

module.exports = NumberGenerator = mongoose.model("numbergenerator", NumberGeneratorSchema , 'numbergenerator');
