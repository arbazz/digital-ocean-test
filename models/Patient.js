const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PatientSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  phone: {
    type: String,
  },
  age: {
    type: Number,
  },
  sex: {
    type: String,
  },
  ssn: {
    type: String,
  },
  ssnEncrypted: {
    type: String,
  },
  deliveryMethod: {
    type: [String],
  },
  isTested: {
    type: String,
    default: "No",
  },
  signature: {
    type: String,
  },
  identityCard: {
    type: String,
  },
  idImage: {
    type: String,
  },
  insuranceImage: {
    type: String,
  },
  isInsured: {
    type: Boolean,
    default: false,
  },
  insuranceCard: {
    type: String,
  },
  covidTestForm: {
    type: String,
  },
  patientTestResultSignOff: {
    type: String,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "employee",
  },
  location: {
    type: Schema.Types.ObjectId,
    ref: "location",
  },
  testType: {
    type: Schema.Types.ObjectId,
    ref: "testtype",
  },
  testedBy: {
    type: Schema.Types.ObjectId,
    ref: "employee",
  },
  testedDate: {
    type: Date,
  },
  concessionNumber: {
    type: String,
  },
  result: {
    type: String,
  },
  resultDate: {
    type: Date,
  },
  docPrescription: {
    type: Boolean,
  },
  docPrescriptionUrl: {
    type: String,
  },
  passport: {
    type: String
  }
});

module.exports = Patient = mongoose.model("patient", PatientSchema, "patient");
