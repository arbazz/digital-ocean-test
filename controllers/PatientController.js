const LocationModel = require("../models/Location");
const EmployeeTypeModel = require("../models/EmployeeType");
const PatientModel = require("../models/Patient");
const RevenueModel = require("../models/Revenue");
const EmployeeModel = require("../models/Employee");
const UserModel = require("../models/User");
const NumberGeneratorModel = require("../models/NumberGenerator");
const helper = require("../helpers/helperService");
const fs = require("fs");
var handlebars = require("handlebars");
var pdf = require("html-pdf");
var options = { format: "Letter" };
const jwt = require("jsonwebtoken");
const CONSTANT = require("../config/constants");
const secretKey = CONSTANT.jwtSecret;
const requestHttp = require("request");
const accessToken = CONSTANT.accessToken;
const { check, validationResult } = require("express-validator");
var CronJob = require("cron").CronJob;
const bcrypt = require("bcryptjs");
const multer = require('multer');
const path = require("path");
const consentForm = require('../public/Pdf/tetindConsent');
const signaturePdf = require('../public/Pdf/Singnature');
const patinetDataTemplate = require('../public/Pdf/PatientDataTemplate');
var html_to_pdf = require('html-pdf-node');
const { v4: uuidv4 } = require('uuid');


var readHTMLFile = function (path, callback) {
  fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
    if (err) {
      console.log(err);
      return
      callback(err);
    } else {
      callback(null, html);
    }
  });
};


const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(null, "IMAGE-" + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
}).single("myImage");


const { Dropbox } = require('dropbox'); // eslint-disable-line import/no-unresolved
var dbx = new Dropbox({ accessToken: "7lMPIuj-bzwAAAAAAAAAAY7lmFGKcMh07Sd9i2bfOkII8SmkM3nhfnDR4KXccI5u" });


const uploadImage = (req, res, idName, idIMage) => {
  return new Promise((res) => {
    fs.readFile(idIMage, function read(err, data) {
      if (err) {
        console.log(err);
      }
      dbx.filesUpload({ path: '/' + idName, contents: data })
        .then(function (ret) {
          // console.log(response.result);
          dbx.sharingCreateSharedLinkWithSettings({
            path: ret.result.path_display,
            "settings": {
              "requested_visibility": "public",
              "audience": "public",
              "access": "viewer",
            }
          }).then((e) => {
            // console.log(e);
            res(e);
          }).catch((err) => {
            console.log(err);
            res('error');
          })
        })
        .catch(function (error) {
          console.error(error);
        });
    })
  })
};



const uploadPdfs = (idName, pdf) => {
  return new Promise((res) => {
    fs.writeFile("pdf.pdf", pdf, function read(err, data) {
      if (err) {
        console.log(err);
        return
      }
      fs.readFile("pdf.pdf", function read(err, data) {
        if (err) {
          console.log(err);
        };
        // console.log("data ", data)
        dbx.filesUpload({ path: '/' + idName, contents: pdf })
          .then(function (ret) {
            // console.log(response.result);
            dbx.sharingCreateSharedLinkWithSettings({
              path: ret.result.path_display,
              "settings": {
                "requested_visibility": "public",
                "audience": "public",
                "access": "viewer",
              }
            }).then((e) => {
              // console.log(e);
              res(e);
            }).catch((err) => {
              console.log(err);
              res('error');
            })
          })
          .catch(function (error) {
            console.error(error);
          });
      })
    });
  });
};

const nameConstruct = (name, ext) => {
  if (ext) {
    return uuidv4() + name + '.' + ext;
  }
}

const patientController = {
  createPatient: async (request, response) => {

    console.log("====== Patient Create API =======");
    console.log("=== Body Params: ===" + JSON.stringify(request.body));
    console.log("====file====", request.files)
    const body = JSON.parse(JSON.stringify(request.body));
    const files = request.files;




    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(422).json({ errors: errors.array() });
    }


    try {
      let path = "./public/uploads/";
      let testTypeArray = JSON.parse(body.testType);
      let htmlTemplate;

      // get uuid auto generated
      let numberDoc = await NumberGeneratorModel.findOneAndUpdate(
        { name: "uuid" },
        { $inc: { value: 1 } },
        { new: true }
      );
      let value = numberDoc.value;
      let sequenceNumber = (value + "").padStart(4, "0");
      let uuid = helper.dateFormat() + sequenceNumber;
      console.log("uuid ===== " + uuid);

      // save patient record
      let patient = {
        firstname: body.firstname,
        lastname: body.lastname,
        fullname: body.firstname + " " + body.lastname,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        dateOfBirth: body.dateOfBirth,
        age: body.age,
        createdBy: body.employeeId,
        location: body.locationId,
        covidTestForm: body.covidTestForm,
        patientTestResultSignOff: body.patientTestResultSignOff,
        signature: body.signature,
        docPrescription: body.docPrescription,
        docPrescriptionUrl: body.docPrescriptionUrl,
      };
      let res;

      for (let i = 0; i < testTypeArray.length; i++) {
        if (testTypeArray[i] == "603f35613ba47f2becaea1ba") {
          console.log("Rapid Test Type is Selected");
          patient.testType = "603f35613ba47f2becaea1ba";
          patient.uuid = uuid + "R";
          patient.deliveryMethod = ["Text/Email"];
          var patientModel = new PatientModel(patient);
          res = await patientModel.save();
        }
      }

      for (let i = 0; i < testTypeArray.length; i++) {
        if (testTypeArray[i] == "603f35943ba47f2becaea1bb") {
          console.log("Antibody Test Type is Selected");
          patient.testType = "603f35943ba47f2becaea1bb";
          patient.uuid = uuid + "A";
          patient.deliveryMethod = ["Text/Email"];
          var patientModel = new PatientModel(patient);
          res = await patientModel.save();
        }
      }

      for (let i = 0; i < testTypeArray.length; i++) {
        if (testTypeArray[i] == "603f35d83ba47f2becaea1bc") {
          console.log("PCR Test Type is Selected");
          const payload = { ssnEncrypted: body.ssn };
          let token = jwt.sign(payload, secretKey);
          patient.ssnEncrypted = token;
          patient.ssn = body.ssn.substr(body.ssn.length - 4);
          patient.testType = "603f35d83ba47f2becaea1bc";
          patient.uuid = uuid;
          patient.sex = body.sex;
          patient.deliveryMethod = body.deliveryMethod;
          patient.identityCard = body.identityCard;
          patient.idImage = body.idImage;
          patient.insuranceImage = body.insuranceImage;
          if (body.isInsured === "true") {
            patient.isInsured = true;
            patient.insuranceCard = body.insuranceCard;
          }
          var patientModel = new PatientModel(patient);
          res = await patientModel.save();
        }
      }

      for (let i = 0; i < testTypeArray.length; i++) {
        if (testTypeArray[i] == "604af9620b8e4575c42e5fd6") {
          console.log("PCR For foreigners Test Type is Selected");
          patient.testType = "604af9620b8e4575c42e5fd6";
          patient.uuid = uuid;
          patient.sex = body.sex;
          patient.passport = body.passport;
          patient.deliveryMethod = body.deliveryMethod;
          var patientModel = new PatientModel(patient);
          res = await patientModel.save();
        }
      };

      response.status(200).json({
        uuid: uuid,
        _id: patientModel._id,
        msg: "Patient record saved successfully",
      });

      console.log("res===> ", res)



      // check test type for email template
      if (testTypeArray.length == 1) {
        if (testTypeArray[0] == "603f35613ba47f2becaea1ba") {
          htmlTemplate = "RapidTestApplicationEmail.html";
        }
        if (testTypeArray[0] == "603f35943ba47f2becaea1bb") {
          htmlTemplate = "AntibodyTestApplicationEmail.html";
        }
        if (testTypeArray[0] == "603f35d83ba47f2becaea1bc") {
          htmlTemplate = "PCRLabTestApplicationEmail.html";
        }
        if (testTypeArray[0] == "604af9620b8e4575c42e5fd6") {
          htmlTemplate = "PCRLabTestApplicationEmail.html";
        }
      }
      if (testTypeArray.length == 2) {
        if (
          testTypeArray.indexOf("603f35613ba47f2becaea1ba") !== -1 &&
          testTypeArray.indexOf("603f35943ba47f2becaea1bb") !== -1
        ) {
          htmlTemplate = "RapidAndAntibodyTestApplicationEmail.html";
        }
        if (
          testTypeArray.indexOf("603f35613ba47f2becaea1ba") !== -1 &&
          testTypeArray.indexOf("603f35d83ba47f2becaea1bc") !== -1
        ) {
          htmlTemplate = "RapidAndPCRLabTestApplicationEmail.html";
        }
        if (
          testTypeArray.indexOf("603f35613ba47f2becaea1ba") !== -1 &&
          testTypeArray.indexOf("604af9620b8e4575c42e5fd6") !== -1
        ) {
          htmlTemplate = "RapidAndPCRLabTestApplicationEmail.html";
        }
        if (
          testTypeArray.indexOf("603f35943ba47f2becaea1bb") !== -1 &&
          testTypeArray.indexOf("603f35d83ba47f2becaea1bc") !== -1
        ) {
          htmlTemplate = "AntibodyAndPCRLabTestApplicationEmail.html";
        }
      }
      if (testTypeArray.length == 3) {
        htmlTemplate = "AllTestsApplicationEmail.html";
      }

      // Download PDF Files and sent email with attachments
      // creating pdf and setting images in urls;

      let dates = new Date();
      dates = dates.toLocaleTimeString() + " " + dates.toDateString();
      let consentPdfBuffer;
      let signOffBuffer;

      let options = { format: 'A4' };
      let consentPdfHtml = {
        content: consentForm(body.firstname + " " + body.lastname, dates, body.signature)
      };
      // console.log("=-=-=-=->", consentPdfHtml)
      let resultSignoff = {
        content: testResultSignOff(body.fullname, body.locationName, body.phone, dates, body.signature)
      }
      let signPdf = {
        content: signaturePdf(
          body.signature,
          dates,
          body.name,
          body.phone,
          body.email,
          body.dateOfBirth,
          body.sex
        )
      }
      html_to_pdf.generatePdf(consentPdfHtml, options).then(async (pdfBuffer) => {
        consentPdfBuffer = pdfBuffer;
        const nameConsent = nameConstruct("consent", 'pdf')
        const consentUrl = await uploadPdfs(nameConsent, pdfBuffer);
        console.log('url', consentUrl.result.url);
        let consentUri = consentUrl.result.url;
        html_to_pdf.generatePdf(resultSignoff, options).then(async (pdfBuffer) => {
          signOffBuffer = pdfBuffer;
          const nameConsent = nameConstruct("consent", 'pdf')
          const signOffUrl = await uploadPdfs(nameConsent, pdfBuffer);
          console.log('url 2 ', signOffUrl.result.url);
          let signUrl = signOffUrl.result.url;
          if (files?.idImage) {
            const idIMage = files?.idImage;
            const idName = nameConstruct(idIMage.name, idIMage.mimetype.replace(/(.*)\//g, ''));
            const filePath = idIMage.tempFilePath
            const resimageurl = await uploadImage(request, response, idName, filePath)
            var idUrl = resimageurl.result.url;
          }
          if (files?.insuranceImage) {
            const inImage = files?.insuranceImage;
            const idName = nameConstruct(inImage.name, inImage.mimetype.replace(/(.*)\//g, ''));
            const filePath = inImage.tempFilePath
            const resimageurl = await uploadImage(request, response, idName, filePath)
            var inUrl = resimageurl.result.url;
          }
          if (files?.docPrescriptionUrl) {
            const inImage = files?.docPrescriptionUrl;
            const idName = nameConstruct(inImage.name, inImage.mimetype.replace(/(.*)\//g, ''));
            const filePath = inImage.tempFilePath
            const resimageurl = await uploadImage(request, response, idName, filePath)
            var docUrl = resimageurl.result.url;
          }


          html_to_pdf.generatePdf(signPdf, options).then(async (pdfBuffer) => {
            const nameConsent = nameConstruct("signature", 'pdf')
            const consentUrl = await uploadPdfs(nameConsent, pdfBuffer);
            console.log('url', consentUrl.result.url);
            var signatureUri = consentUrl.result.url;

            let signature = signatureUri;
            let covidTestForm = consentUri;
            let patientTestResultSignOff = signUrl;

            let signatureFileName = `signature-${uuid}.pdf`;
            let signatureFileNameWithPath = `${path}signature-${uuid}.pdf`;
            let covidTestFormFileName = `covidTestFormFile-${uuid}.pdf`;
            let covidTestFormFileNameWithPath = `${path}covidTestFormFile-${uuid}.pdf`;
            let patientTestResultSignOffFileName = `patientTestResultSignOff-${uuid}.pdf`;
            let patientTestResultSignOffFileNameWithPath = `${path}patientTestResultSignOff-${uuid}.pdf`;

            // adding urls now

            let urls = {
              covidTestForm: consentUri,
              patientTestResultSignOff: signUrl,
              signature: signatureUri,
              docPrescriptionUrl: docUrl,
              identityCard: idUrl,
              idImage: idUrl,
              insuranceImage: inUrl,
            };

            let patient = await PatientModel.findOneAndUpdate(
              { _id: patientModel._id },
              { $set: urls },
              { new: true }
            );

            if (signature) {
              console.log("sending email")
              let firstPart = signature.split("=")[0];
              signature = firstPart + "=1";
              let stream1 = requestHttp(signature, {
                auth: { bearer: accessToken },
              }).pipe(fs.createWriteStream(signatureFileNameWithPath));
              stream1.on("finish", function () {
                if (covidTestForm) {
                  let firstPart = covidTestForm.split("=")[0];
                  covidTestForm = firstPart + "=1";
                  let stream2 = requestHttp(covidTestForm, {
                    auth: { bearer: accessToken },
                  }).pipe(fs.createWriteStream(covidTestFormFileNameWithPath));

                  stream2.on("finish", function () {
                    if (patientTestResultSignOff) {
                      let firstPart = patientTestResultSignOff.split("=")[0];
                      patientTestResultSignOff = firstPart + "=1";
                      let stream3 = requestHttp(patientTestResultSignOff, {
                        auth: { bearer: accessToken },
                      }).pipe(
                        fs.createWriteStream(patientTestResultSignOffFileNameWithPath)
                      );
                      stream3.on("finish", function () {
                        // send email

                        helper.patientCreateEmail(
                          patient,
                          htmlTemplate,
                          signatureFileName,
                          signatureFileNameWithPath,
                          covidTestFormFileName,
                          covidTestFormFileNameWithPath,
                          patientTestResultSignOffFileName,
                          patientTestResultSignOffFileNameWithPath
                        );
                        // response.status(200).json({
                        //   uuid: uuid,
                        //   _id: patientModel._id,
                        //   msg: "Patient record saved successfully",
                        // });

                      });
                    }
                  });
                }
              });
            }

          })



        });
      });



    } catch (err) {
      console.log(err);
      response.status(500).json({ errors: { msg: err } });
    }
  },

  createPatientByLandingPage: async (request, response) => {
    console.log("====== Patient Create Landing Page API =======");
    console.log("=== Body Params: ===" + JSON.stringify(request.body));

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(422).json({ errors: errors.array() });
    }

    const body = JSON.parse(JSON.stringify(request.body));
    // check if all params are present

    try {
      let path = "./public/uploads/";
      let testTypeArray = body.testType;
      let htmlTemplate;

      // get uuid auto generated
      let numberDoc = await NumberGeneratorModel.findOneAndUpdate(
        { name: "uuid" },
        { $inc: { value: 1 } },
        { new: true }
      );
      let value = numberDoc.value;
      let sequenceNumber = (value + "").padStart(4, "0");
      let uuid = helper.dateFormat() + sequenceNumber;
      console.log("uuid ===== " + uuid);

      // search employee by locationId
      let user = await UserModel.findOne({
        locations: body.locationId,
        type: "Admin",
      });
      console.log("Admin is " + user);
      console.log("Admin is " + user.username);
      let empArray = [];
      let employees = await EmployeeModel.find(
        { createdBy: user._id },
        { _id: 1 }
      ).exec();
      employees.map((empId) => {
        empArray.push(empId._id);
      });

      console.log("Employee Id found " + empArray[0]);

      // save patient record
      let test = "";
      let patient = {
        firstname: body.firstname,
        lastname: body.lastname,
        fullname: body.firstname + " " + body.lastname,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        dateOfBirth: body.dateOfBirth,
        age: body.age,
        createdBy: empArray[0],
        location: body.locationId,
        covidTestForm: body.covidTestForm,
        patientTestResultSignOff: body.patientTestResultSignOff,
        signature: body.signature,
        docPrescription: body.docPrescription,
        docPrescriptionUrl: body.docPrescriptionUrl,
      };

      for (let i = 0; i < testTypeArray.length; i++) {
        if (testTypeArray[i] == "603f35613ba47f2becaea1ba") {
          console.log("Rapid Test Type is Selected");
          test = "Rapid Test"
          patient.testType = "603f35613ba47f2becaea1ba";
          patient.uuid = uuid + "R";
          patient.deliveryMethod = ["Text/Email"];
          let patientModel = new PatientModel(patient);
          await patientModel.save();
        }
      }

      for (let i = 0; i < testTypeArray.length; i++) {
        if (testTypeArray[i] == "603f35943ba47f2becaea1bb") {
          console.log("Antibody Test Type is Selected");
          test = "Antibody Test";
          patient.testType = "603f35943ba47f2becaea1bb";
          patient.uuid = uuid + "A";
          patient.deliveryMethod = ["Text/Email"];
          let patientModel = new PatientModel(patient);
          await patientModel.save();
        }
      }

      for (let i = 0; i < testTypeArray.length; i++) {
        if (testTypeArray[i] == "603f35d83ba47f2becaea1bc") {
          console.log("PCR Test Type is Selected");
          // generate ssn Encrypted token
          test = "PCR Test"
          const payload = { ssnEncrypted: body.ssn };
          let token = jwt.sign(payload, secretKey);
          patient.ssnEncrypted = token;
          patient.ssn = body.ssn.substr(body.ssn.length - 4);
          patient.testType = "603f35d83ba47f2becaea1bc";
          patient.uuid = uuid;
          patient.sex = body.sex;
          patient.ssn = body.ssn;
          patient.deliveryMethod = body.deliveryMethod;
          patient.identityCard = body.identityCard;
          patient.idImage = body.idImage;
          patient.insuranceImage = body.insuranceImage;
          if (body.isInsured === "true") {
            patient.isInsured = true;
            patient.insuranceCard = body.insuranceCard;
          }
          let patientModel = new PatientModel(patient);
          await patientModel.save();
        }
      }

      for (let i = 0; i < testTypeArray.length; i++) {
        if (testTypeArray[i] == "604af9620b8e4575c42e5fd6") {
          console.log("PCR For foreigners Test Type is Selected");
          test = "PCR For International Travellers"
          patient.testType = "604af9620b8e4575c42e5fd6";
          patient.uuid = uuid;
          patient.sex = body.sex;
          patient.passport = body.passport;
          patient.deliveryMethod = body.deliveryMethod;
          var patientModel = new PatientModel(patient);
          await patientModel.save();
        }
      }


      // check test type for email template
      if (testTypeArray.length == 1) {
        if (testTypeArray[0] == "603f35613ba47f2becaea1ba") {
          htmlTemplate = "RapidTestApplicationEmail.html";
        }
        if (testTypeArray[0] == "603f35943ba47f2becaea1bb") {
          htmlTemplate = "AntibodyTestApplicationEmail.html";
        }
        if (testTypeArray[0] == "603f35d83ba47f2becaea1bc") {
          htmlTemplate = "PCRLabTestApplicationEmail.html";
        }
        if (testTypeArray[0] == "604af9620b8e4575c42e5fd6") {
          htmlTemplate = "PCRLabTestApplicationEmail.html";
        }
      }
      if (testTypeArray.length == 2) {
        if (
          testTypeArray.indexOf("603f35613ba47f2becaea1ba") !== -1 &&
          testTypeArray.indexOf("603f35943ba47f2becaea1bb") !== -1
        ) {
          htmlTemplate = "RapidAndAntibodyTestApplicationEmail.html";
        }
        if (
          testTypeArray.indexOf("603f35613ba47f2becaea1ba") !== -1 &&
          testTypeArray.indexOf("603f35d83ba47f2becaea1bc") !== -1
        ) {
          htmlTemplate = "RapidAndPCRLabTestApplicationEmail.html";
        }
        if (
          testTypeArray.indexOf("603f35613ba47f2becaea1ba") !== -1 &&
          testTypeArray.indexOf("604af9620b8e4575c42e5fd6") !== -1
        ) {
          htmlTemplate = "RapidAndPCRLabTestApplicationEmail.html";
        }
        if (
          testTypeArray.indexOf("603f35943ba47f2becaea1bb") !== -1 &&
          testTypeArray.indexOf("603f35d83ba47f2becaea1bc") !== -1
        ) {
          htmlTemplate = "AntibodyAndPCRLabTestApplicationEmail.html";
        }
      }
      if (testTypeArray.length == 3) {
        htmlTemplate = "AllTestsApplicationEmail.html";
      }

      // Download PDF Files and sent email with attachments
      let signature = body.signature;
      let covidTestForm = body.covidTestForm;
      let patientTestResultSignOff = body.patientTestResultSignOff;

      let signatureFileName = `signature-${uuid}.pdf`;
      let signatureFileNameWithPath = `${path}signature-${uuid}.pdf`;
      let covidTestFormFileName = `covidTestFormFile-${uuid}.pdf`;
      let covidTestFormFileNameWithPath = `${path}covidTestFormFile-${uuid}.pdf`;
      let patientTestResultSignOffFileName = `patientTestResultSignOff-${uuid}.pdf`;
      let patientTestResultSignOffFileNameWithPath = `${path}patientTestResultSignOff-${uuid}.pdf`;

      if (signature) {
        let firstPart = signature.split("=")[0];
        signature = firstPart + "=1";
        let stream1 = requestHttp(signature, {
          auth: { bearer: accessToken },
        }).pipe(fs.createWriteStream(signatureFileNameWithPath));
        stream1.on("finish", function () {
          if (covidTestForm) {
            let firstPart = covidTestForm.split("=")[0];
            covidTestForm = firstPart + "=1";
            let stream2 = requestHttp(covidTestForm, {
              auth: { bearer: accessToken },
            }).pipe(fs.createWriteStream(covidTestFormFileNameWithPath));

            stream2.on("finish", function () {
              if (patientTestResultSignOff) {
                let firstPart = patientTestResultSignOff.split("=")[0];
                patientTestResultSignOff = firstPart + "=1";
                let stream3 = requestHttp(patientTestResultSignOff, {
                  auth: { bearer: accessToken },
                }).pipe(
                  fs.createWriteStream(patientTestResultSignOffFileNameWithPath)
                );
                stream3.on("finish", function () {
                  // send email
                  // const htmlTemplate = 'covidTestApplicationEmailForLandingPagePatient.html';

                  helper.patientCreateEmail(
                    patient,
                    htmlTemplate,
                    signatureFileName,
                    signatureFileNameWithPath,
                    covidTestFormFileName,
                    covidTestFormFileNameWithPath,
                    patientTestResultSignOffFileName,
                    patientTestResultSignOffFileNameWithPath
                  );
                  // send text message about uuid
                  helper.sendTextMessagesForUUID(patient, uuid, test);

                  response.status(200).json({
                    uuid: uuid,
                    msg: "Patient record saved successfully",
                  });
                });
              }
            });
          }
        });
      }
    } catch (err) {
      console.log(err);
      response.status(500).json({ errors: { msg: err } });
    }
  },

  updatePatient: async (request, response) => {
    console.log("====== Update Patient API =======");
    console.log("=== Body Params: ===" + JSON.stringify(request.body));

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(422).json({ errors: errors.array() });
    }

    const body = JSON.parse(JSON.stringify(request.body));
    // check if all params are present

    try {
      // update patient record
      let updatePatient = {
        firstname: body.firstname,
        lastname: body.lastname,
        fullname: body.firstname + " " + body.lastname,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        dateOfBirth: body.dateOfBirth,
        age: body.age,
        sex: body.sex,
        deliveryMethod: body.deliveryMethod,
        // ,identityCard: `/uploads/user/${request.file.originalname}`
      };

      // if(body.isInsured){
      //     patient.isInsured = true ;
      //     patient.insuranceCard =  `/uploads/user/${request.file.originalname}` ;
      // }

      let patient = await PatientModel.findOneAndUpdate(
        { _id: body.patientId },
        { $set: updatePatient },
        { new: true }
      );

      response.status(200).json({
        patient,
        msg: "Patient record updated successfully",
      });
    } catch (err) {
      console.log(err);
      response.status(500).json({ errors: { msg: err } });
    }
  },

  updateConcessionNumber: async (request, response) => {
    console.log("====== Update Concession Number API =======");
    console.log("=== Body Params: ===" + JSON.stringify(request.body));

    const body = JSON.parse(JSON.stringify(request.body));
    // check if all params are present
    if (body.patientId && body.concessionNumber) {
      try {
        // update patient record
        let updatePatient = {
          concessionNumber: body.concessionNumber,
        };

        // if(body.isInsured){
        //     patient.isInsured = true ;
        //     patient.insuranceCard =  `/uploads/user/${request.file.originalname}` ;
        // }

        let patient = await PatientModel.findOneAndUpdate(
          { _id: body.patientId },
          { $set: updatePatient },
          { new: true }
        );

        response.status(200).json({
          patient,
          msg: "Patient record updated successfully",
        });
      } catch (err) {
        console.log(err);
        response.status(500).json({ errors: { msg: err } });
      }
    } else {
      response.status(500).json({ errors: { msg: "parameters are missing" } });
    }
  },

  updatePatientResults: async (request, response) => {
    console.log("====== Update Patient Results API =======");
    console.log("=== Body Params: ===" + JSON.stringify(request.body));
    const body = JSON.parse(JSON.stringify(request.body));

    // check if all params are present
    if (body.patients.length > 0) {
      let patients = body.patients;

      try {
        let allLocations = await LocationModel.find().exec();
        let path = "./public/uploads/";
        // update patient record
        let allDoneResults = await Promise.all(
          patients.map(async (patient) => {
            let id = patient.patientId;
            let result = patient.result;
            let updatedPatient = await PatientModel.findOneAndUpdate(
              { _id: id },
              { $set: { result: result, resultDate: Date.now() } },
              { new: true }
            ).exec();
            let uuid = updatedPatient.uuid;
            let location = await LocationModel.findOne({
              _id: updatedPatient.location,
            }).exec();
            let emailTemplate;
            console.log("id is " + id);
            console.log("result is " + result);
            console.log("Location is " + location.name);

            // selecting testype for text
            let test = '';
            // check if deliveryMethod is Mail then send email to daisy@hcplabs.com
            let deliveryMethod = updatedPatient.deliveryMethod;
            deliveryMethod.map((method) => {
              if (method == "Text/Email") {
                console.log("Text/Email method is selected");
                // send email
                // check if antibody test type
                if (updatedPatient.testType == "603f35943ba47f2becaea1bb") {
                  test = "Anti Body"
                  if (result == "Positive") {
                    emailTemplate = "AntibodyTestPositiveResult.html";
                  }
                  if (result == "Negative") {
                    emailTemplate = "AntibodyTestNegativeResult.html";
                  }
                }
                // check if PCR test type
                if (updatedPatient.testType == "603f35d83ba47f2becaea1bc" || updatedPatient.testType === "604af9620b8e4575c42e5fd6") {
                  test = 'PCR Lab Test'
                  if (result == "Positive") {
                    emailTemplate = "PCRLabTestPositiveResult.html";
                  }
                  if (result == "Negative") {
                    emailTemplate = "PCRLabTestNegativeResult.html";
                  }
                }

                helper.testResultEmail(
                  emailTemplate,
                  updatedPatient,
                  location.name
                );
                // send text
                helper.sendTextMessages(updatedPatient, result, test);
              }

              if (method == "Mail") {
                console.log("Mail method is selected");
                // Mail method is selected
                // Download PDF Files and sent email with attachments

                let signature = updatedPatient.signature;
                let covidTestForm = updatedPatient.covidTestForm;
                let patientTestResultSignOff =
                  updatedPatient.patientTestResultSignOff;

                let signatureFileName = `signature-${uuid}.pdf`;
                let signatureFileNameWithPath = `${path}signature-${uuid}.pdf`;
                let covidTestFormFileName = `covidTestFormFile-${uuid}.pdf`;
                let covidTestFormFileNameWithPath = `${path}covidTestFormFile-${uuid}.pdf`;
                let patientTestResultSignOffFileName = `patientTestResultSignOff-${uuid}.pdf`;
                let patientTestResultSignOffFileNameWithPath = `${path}patientTestResultSignOff-${uuid}.pdf`;

                if (signature) {
                  let firstPart = signature.split("=")[0];
                  signature = firstPart + "=1";
                  let stream1 = requestHttp(signature, {
                    auth: { bearer: accessToken },
                  }).pipe(fs.createWriteStream(signatureFileNameWithPath));
                  stream1.on("finish", function () {
                    if (covidTestForm) {
                      let firstPart = covidTestForm.split("=")[0];
                      covidTestForm = firstPart + "=1";
                      let stream2 = requestHttp(covidTestForm, {
                        auth: { bearer: accessToken },
                      }).pipe(
                        fs.createWriteStream(covidTestFormFileNameWithPath)
                      );

                      stream2.on("finish", function () {
                        if (patientTestResultSignOff) {
                          let firstPart = patientTestResultSignOff.split(
                            "="
                          )[0];
                          patientTestResultSignOff = firstPart + "=1";
                          let stream3 = requestHttp(patientTestResultSignOff, {
                            auth: { bearer: accessToken },
                          }).pipe(
                            fs.createWriteStream(
                              patientTestResultSignOffFileNameWithPath
                            )
                          );
                          stream3.on("finish", function () {
                            let filePath;
                            if (result == "Positive") {
                              filePath =
                                "./public/template/covidPositiveResult.html";
                            }
                            if (result == "Negative") {
                              filePath =
                                "./public/template/covidNegativeResult.html";
                            }
                            readHTMLFile(filePath, function (err, html) {
                              var template = handlebars.compile(html);
                              var replacements = {
                                username:
                                  updatedPatient.firstname +
                                  " " +
                                  updatedPatient.lastname,
                                location: location.name,
                                result: updatedPatient.result,
                              };
                              let htmlTemplateOfEmail = template(replacements);
                              let emailPDF = `email-${uuid}.pdf`;
                              let emailPDFWithPath = `${path}email-${uuid}.pdf`;
                              pdf
                                .create(htmlTemplateOfEmail, options)
                                .toFile(
                                  "./public/uploads/" + emailPDF,
                                  function (err, res) {
                                    if (err) {
                                      console.log(err);
                                    }
                                    // send email
                                    console.log("sent PDFs to Daisy email");
                                    helper.sendPatientsPDFsForMail(
                                      emailPDF,
                                      emailPDFWithPath,
                                      signatureFileName,
                                      signatureFileNameWithPath,
                                      covidTestFormFileName,
                                      covidTestFormFileNameWithPath,
                                      patientTestResultSignOffFileName,
                                      patientTestResultSignOffFileNameWithPath
                                    );
                                  }
                                );
                            });
                          });
                        }
                      });
                    }
                  });
                }
              }
            });
          })
        );
        response.status(200).json({
          msg: "Patient results updated successfully",
        });
      } catch (err) {
        console.log(err);
        response.status(500).json({ errors: { msg: err } });
      }
    } else {
      response.status(500).json({ errors: { msg: "parameters are missing" } });
    }
  },

  updateRapidTestPatientResults: async (request, response) => {
    console.log("====== Update Rapid Test Patient Results API =======");
    console.log("=== Body Params: ===" + JSON.stringify(request.body));
    const body = JSON.parse(JSON.stringify(request.body));

    // check if all params are present
    if (body.patientId && body.result) {
      try {
        let id = body.patientId;
        let result = body.result;
        let updatedPatient = await PatientModel.findOneAndUpdate(
          { _id: id },
          { $set: { result: result, resultDate: Date.now() } },
          { new: true }
        ).exec();
        let uuid = updatedPatient.uuid;
        let location = await LocationModel.findOne({
          _id: updatedPatient.location,
        }).exec();
        let emailTemplate;
        console.log("id is " + id);
        console.log("result is " + result);
        console.log("Location is " + location.name);
        if (result == "Positive") {
          emailTemplate = "RapidTestPositiveResult.html";
        }
        if (result == "Negative") {
          emailTemplate = "RapidTestNegativeResult.html";
        }
        console.log("Text/Email method is selected");
        // send email
        helper.testResultEmail(emailTemplate, updatedPatient, location.name);
        // send text
        helper.sendTextMessages(updatedPatient, result, "Rapid Test");

        response.status(200).json({
          msg: "Patient result updated successfully",
        });
      } catch (err) {
        console.log(err);
        response.status(500).json({ errors: { msg: err } });
      }
    } else {
      response.status(500).json({ errors: { msg: "parameters are missing" } });
    }
  },

  getAllConcessionNumberPatients: async (request, response) => {
    console.log("====== Get All Concession Number Patients API =======");

    try {
      let patients = await PatientModel.find({
        concessionNumber: { $exists: true },
      });
      if (patients.length > 0) {
        response.status(200).json({
          patients,
          msg: "Patient record found successfully",
        });
      } else {
        response.status(400).json({
          patients,
          msg: "No record found",
        });
      }
    } catch (err) {
      console.log(err);
      response.status(500).json({ errors: { msg: err } });
    }
  },

  searchPatient: async (request, response) => {
    console.log("====== Search Patient  API =======");
    console.log("=== Body Params: ===" + JSON.stringify(request.body));

    const body = JSON.parse(JSON.stringify(request.body));
    // check if all params are present
    if (body.patientName) {
      try {
        let name = body.patientName;

        // get all employess to find their patients
        let user = await EmployeeModel.findById(request.user.id);
        console.log("Employee Admin Id is ====== " + user.createdBy);
        console.log("Employee Id is ====== " + user._id);
        // get All admin employees to get their patients
        let allEmployees = await EmployeeModel.find(
          { createdBy: user.createdBy },
          { _id: 1 }
        ).exec();
        let empArray = [];
        allEmployees.map((emp) => {
          empArray.push(emp._id);
        });

        // search by name and uuid
        let patients = await PatientModel.find({
          $or: [{ fullname: { $regex: name, $options: "i" } }, { uuid: name }],
          createdBy: { $in: empArray },
        })
          .sort({ createdDate: -1 })
          .exec();

        if (patients.length > 0) {
          return response
            .status(200)
            .json({ patients, msg: "Patients found successfully" });
        } else {
          return response
            .status(400)
            .json({ msg: "No patient found with this name" });
        }
      } catch (err) {
        response.status(500).json({ errors: { msg: err } });
      }
    } else {
      response.status(500).json({ errors: { msg: "parameters are missing" } });
    }
  },

  searchPatientByLandingPage: async (request, response) => {
    console.log("====== Search Patient By Landing Page API =======");
    console.log("=== Body Params: ===" + JSON.stringify(request.body));

    const body = JSON.parse(JSON.stringify(request.body));
    // check if all params are present
    if ((body.uuid && body.lastname) || (body.dateOfBirth && body.lastname)) {
      try {
        // search query
        let query = {};

        if (body.uuid) {
          query = {
            uuid: body.uuid,
            lastname: { $regex: body.lastname, $options: "i" },
          };
        }
        if (body.dateOfBirth) {
          query = {
            dateOfBirth: body.dateOfBirth,
            lastname: { $regex: body.lastname, $options: "i" },
          };
        }

        let patient = await PatientModel.findOne(query).exec();
        if (patient) {
          console.log("Patient exists");
          // check patient results update
          if (patient.result) {
            // send email about patient results
            let location = await LocationModel.findOne({
              _id: patient.location,
            }).exec();
            console.log("id is " + patient._id);
            console.log("result is " + patient.result);
            console.log("Location is " + location.name);
            let emailTemplate;
            let result = patient.result;
            // send email
            // check if rapid test type
            if (patient.testType == "603f35613ba47f2becaea1ba") {
              if (result == "Positive") {
                emailTemplate = "RapidTestPositiveResult.html";
              }
              if (result == "Negative") {
                emailTemplate = "RapidTestNegativeResult.html";
              }
            }
            // check if antibody test type
            if (patient.testType == "603f35943ba47f2becaea1bb") {
              if (result == "Positive") {
                emailTemplate = "AntibodyTestPositiveResult.html";
              }
              if (result == "Negative") {
                emailTemplate = "AntibodyTestNegativeResult.html";
              }
            }
            // check if PCR test type
            if (patient.testType == "603f35d83ba47f2becaea1bc") {
              if (result == "Positive") {
                emailTemplate = "PCRLabTestPositiveResult.html";
              }
              if (result == "Negative") {
                emailTemplate = "PCRLabTestNegativeResult.html";
              }
            }

            helper.testResultEmail(emailTemplate, patient, location.name);
            // send text
            // helper.sendTextMessages(patient, patient.result);
            return response
              .status(200)
              .json({ msg: "Result has sent via email" });
          } else {
            return response
              .status(400)
              .json({ msg: "Result is not updated yet!" });
          }
        } else {
          console.log("No patient found");
          return response.status(400).json({ msg: "No patient found" });
        }
      } catch (err) {
        response.status(500).json({ errors: { msg: err } });
      }
    } else {
      response.status(500).json({ errors: { msg: "parameters are missing" } });
    }
  },

  searchPatientByDate: async (request, response) => {
    console.log("====== Search Patient by date API =======");
    console.log("=== Body Params: ===" + JSON.stringify(request.body));

    const { query } = request;
    const { skip, limit } = query;
    console.log(query);
    console.log("skip : " + skip + "and limit : " + limit);

    const body = JSON.parse(JSON.stringify(request.body));
    // check if all params are present
    if (body.startDate && body.endDate) {
      try {
        let start = body.startDate;
        let end = body.endDate;
        let patients = await PatientModel.find({
          createdDate: { $gte: start, $lte: end },
          isTested: "Yes",
        })
          .sort({ createdDate: -1 })
          .skip(Number(skip))
          .limit(Number(limit))
          .exec();
        if (patients.length > 0) {
          return response
            .status(200)
            .json({ patients, msg: "Patients found successfully" });
        } else {
          return response
            .status(400)
            .json({ msg: "No patient found in this date" });
        }
      } catch (err) {
        response.status(500).json({ errors: { msg: err } });
      }
    } else {
      response.status(500).json({ errors: { msg: "parameters are missing" } });
    }
  },

  searchPatientLab: async (request, response) => {
    console.log("====== Search Patient by search API =======");
    console.log("=== Body Params: ===" + JSON.stringify(request.body));

    const { query } = request;
    const { skip, limit } = query;
    console.log(query);
    console.log("skip : " + skip + "and limit : " + limit);

    const body = JSON.parse(JSON.stringify(request.body));
    // check if all params are present
    if (body.searchkey) {
      try {
        let name = body.searchkey;
        let patients = await PatientModel.find({
          $or: [{ fullname: { $regex: name, $options: "i" } }, { uuid: name }],
          isTested: "Yes",
        })
          .sort({ createdDate: -1 })
          .skip(Number(skip))
          .limit(Number(limit))
          .exec();
        if (patients.length > 0) {
          return response
            .status(200)
            .json({ patients, msg: "Patients found successfully" });
        } else {
          return response
            .status(400)
            .json({ msg: "No patient found in this date" });
        }
      } catch (err) {
        console.log(err)
        response.status(500).json({ errors: { msg: err } });
      }
    } else {
      response.status(500).json({ errors: { msg: "parameters are missing" } });
    }
  },

  updatePatientEmailOrPhone: async (request, response) => {

    console.log("====== Update Patient Email Or Phone API =======");
    console.log("=== Body Params: ===" + JSON.stringify(request.body));

    try {
      const body = JSON.parse(JSON.stringify(request.body));
      let id = body.patientId;
      // update patient record
      let updatePatient = {};

      if (body.email) {
        updatePatient.email = body.email;
      }

      if (body.phone) {
        updatePatient.phone = body.phone;
      }

      let patient = await PatientModel.findOneAndUpdate(
        { _id: id },
        { $set: updatePatient },
        { new: true }
      ).exec();

      response.status(200).json({
        patient,
        msg: "Patient record updated successfully",
      });
    } catch (err) {
      console.log(err);
      response.status(500).json({ errors: { msg: err } });
    }
  },

  getAllTestedPatientsByMonthDate: async (request, response) => {
    console.log("====== Search Patient by Month date API =======");
    console.log("=== Body Params: ===" + JSON.stringify(request.body));

    const body = JSON.parse(JSON.stringify(request.body));
    // check if all params are present
    if (body.month) {
      try {
        let date = new Date();
        let month = Number(body.month);
        let nextmonth = Number(month + 1);
        if (nextmonth < 10) {
          nextmonth = `0${nextmonth}`;
        }
        if (month < 10) {
          month = `0${month}`;
        }

        let startDate = `${date.getFullYear()}-${month}-01`;
        let endDate = `${date.getFullYear()}-${nextmonth}-01`;
        console.log(
          "startDate ==== " + startDate + " ====== endDate===== " + endDate
        );

        let patients = await PatientModel.find({
          createdDate: { $gte: startDate, $lt: endDate },
          isTested: "Yes",
        }).exec();

        if (patients.length > 0) {
          return response
            .status(200)
            .json({ patients, msg: "Patients found successfully" });
        } else {
          return response
            .status(400)
            .json({ msg: "No patient found in this date" });
        }
      } catch (err) {
        console.log(err);
        response.status(500).json({ errors: { msg: err } });
      }
    } else {
      response.status(500).json({ errors: { msg: "parameters are missing" } });
    }
  },

  getAllTestedPatientsByMonthDateRelatedToJobId: async (request, response) => {
    console.log(
      "====== Search Patient by Month date Related To JobId API ======="
    );
    console.log("=== Body Params: ===" + JSON.stringify(request.body));

    const body = JSON.parse(JSON.stringify(request.body));
    // check if all params are present
    if (body.month) {
      try {
        let date = new Date();
        let month = Number(body.month);
        let nextmonth = Number(month + 1);
        if (nextmonth < 10) {
          nextmonth = `0${nextmonth}`;
        }
        if (month < 10) {
          month = `0${month}`;
        }

        let startDate = `${date.getFullYear()}-${month}-01`;
        let endDate = `${date.getFullYear()}-${nextmonth}-01`;
        console.log(
          "startDate ==== " + startDate + " ====== endDate===== " + endDate
        );

        let user = await UserModel.findById(request.user.id);
        console.log("Admin Type is ====== " + user.type);
        console.log("Admin Id is ====== " + user._id);
        let empArray = [];
        let employees = await EmployeeModel.find(
          { createdBy: user._id },
          { _id: 1 }
        ).exec();

        console.log(employees);

        employees.map((empId) => {
          empArray.push(empId._id);
        });
        console.log(empArray);

        let patients = await PatientModel.find({
          createdDate: { $gte: startDate, $lt: endDate },
          isTested: "Yes",
          testedBy: { $in: empArray },
        }).exec();

        if (patients.length > 0) {
          return response
            .status(200)
            .json({ patients, msg: "Patients found successfully" });
        } else {
          return response
            .status(400)
            .json({ msg: "No patient found in this date" });
        }
      } catch (err) {
        console.log(err);
        response.status(500).json({ errors: { msg: err } });
      }
    } else {
      response.status(500).json({ errors: { msg: "parameters are missing" } });
    }
  },

  getTotalTestedPatientsOfLocationByDate: async (request, response) => {
    console.log(
      "======Get All Tested Patient Numbers Location Wise By Date API ======="
    );
    console.log("=== Body Params: ===" + JSON.stringify(request.body));

    const body = JSON.parse(JSON.stringify(request.body));
    // check if all params are present
    if (body.date) {
      try {
        let locations = await LocationModel.find();
        let startDate = body.date;

        let endDate = helper.nextDate(startDate);

        console.log(
          "startDate === " + startDate + " endDate ====== " + endDate
        );
        let patients = await Promise.all(
          locations.map(async (location) => {
            let locationName = location.name;
            let count = await PatientModel.find({
              isTested: "Yes",
              location: location._id,
              createdDate: { $gte: startDate, $lt: endDate },
            })
              .count()
              .exec();
            return { locationName: locationName, total: count };
          })
        );
        let totalPatients = await PatientModel.find({
          isTested: "Yes",
          createdDate: { $gte: startDate, $lt: endDate },
        })
          .count()
          .exec();
        return response
          .status(200)
          .json({
            patients,
            totalPatients,
            msg: "Total Tested patients found successfully",
          });
      } catch (err) {
        console.log(err);
        response.status(500).json({ errors: { msg: err } });
      }
    } else {
      response.status(500).json({ errors: { msg: "parameters are missing" } });
    }
  },

  getTotalTestedPatientsOfLocationByDateRelatedToJobId: async (
    request,
    response
  ) => {
    console.log(
      "======Get All Tested Patient Numbers Location Wise By Date Related to JobId API ======="
    );
    console.log("=== Body Params: ===" + JSON.stringify(request.body));

    const body = JSON.parse(JSON.stringify(request.body));
    // check if all params are present
    if (body.date) {
      try {
        let user = await UserModel.findById(request.user.id);
        console.log("Admin Type is ====== " + user.type);
        console.log("Admin Id is ====== " + user._id);
        let empArray = [];
        let employees = await EmployeeModel.find(
          { createdBy: user._id },
          { _id: 1 }
        ).exec();
        employees.map((empId) => {
          empArray.push(empId._id);
        });

        let locations = await LocationModel.find({
          _id: { $in: user.locations },
        });
        let startDate = body.date;
        let endDate = helper.nextDate(startDate);
        console.log(
          "startDate === " + startDate + " endDate ====== " + endDate
        );

        let patients = await Promise.all(
          locations.map(async (location) => {
            let locationName = location.name;
            let count = await PatientModel.find({
              isTested: "Yes",
              location: location._id,
              testedBy: { $in: empArray },
              createdDate: { $gte: startDate, $lt: endDate },
            })
              .count()
              .exec();
            return { locationName: locationName, total: count };
          })
        );
        let totalPatients = await PatientModel.find({
          isTested: "Yes",
          testedBy: { $in: empArray },
          createdDate: { $gte: startDate, $lt: endDate },
        })
          .count()
          .exec();
        return response
          .status(200)
          .json({
            patients,
            totalPatients,
            msg: "Total Tested patients found successfully",
          });
      } catch (err) {
        console.log(err);
        response.status(500).json({ errors: { msg: err } });
      }
    } else {
      response.status(500).json({ errors: { msg: "parameters are missing" } });
    }
  },

  getAllTestedPatientsOfAllLocationsByDateRange: async (request, response) => {
    console.log(
      "======Get All Tested Patients Of All Locations By Date API ======="
    );
    console.log("=== Body Params: ===" + JSON.stringify(request.body));

    const body = JSON.parse(JSON.stringify(request.body));
    // check if all params are present
    if (body.startDate && body.endDate) {
      try {
        let startDate = body.startDate;
        let endDate = body.endDate;

        console.log(
          "startDate === " + startDate + " endDate ====== " + endDate
        );

        let totalPatients = await PatientModel.find({
          isTested: "Yes",
          createdDate: { $gte: startDate, $lte: endDate },
        }).exec();

        return response
          .status(200)
          .json({
            totalPatients,
            msg: "Total Tested patients found successfully",
          });
      } catch (err) {
        console.log(err);
        response.status(500).json({ errors: { msg: err } });
      }
    } else {
      response.status(500).json({ errors: { msg: "parameters are missing" } });
    }
  },

  getAllTestedPatientsOfAllLocationsByDateRangeRelatedToJobId: async (
    request,
    response
  ) => {
    console.log(
      "======Get All Tested Patients Of All Locations By Date Related to Job Id API ======="
    );
    console.log("=== Body Params: ===" + JSON.stringify(request.body));

    const body = JSON.parse(JSON.stringify(request.body));
    // check if all params are present
    if (body.startDate && body.endDate) {
      try {
        let startDate = body.startDate;
        let endDate = body.endDate;

        console.log(
          "startDate === " + startDate + " endDate ====== " + endDate
        );

        let user = await UserModel.findById(request.user.id);
        console.log("Admin Type is ====== " + user.type);
        console.log("Admin Id is ====== " + user._id);
        let empArray = [];
        let employees = await EmployeeModel.find(
          { createdBy: user._id },
          { _id: 1 }
        ).exec();

        console.log(employees);

        employees.map((empId) => {
          empArray.push(empId._id);
        });
        console.log(empArray);

        let totalPatients = await PatientModel.find({
          isTested: "Yes",
          testedBy: { $in: empArray },
          createdDate: { $gte: startDate, $lte: endDate },
        }).exec();

        return response
          .status(200)
          .json({
            totalPatients,
            msg: "Total Tested patients found successfully",
          });
      } catch (err) {
        console.log(err);
        response.status(500).json({ errors: { msg: err } });
      }
    } else {
      response.status(500).json({ errors: { msg: "parameters are missing" } });
    }
  },

  getAllTestedPatientsOfLocationByDateRange: async (request, response) => {
    console.log(
      "======Get All Tested Patient Numbers Location Wise By Date API ======="
    );
    console.log("=== Body Params: ===" + JSON.stringify(request.body));

    const body = JSON.parse(JSON.stringify(request.body));
    // check if all params are present
    if (body.startDate && body.endDate && body.locationId) {
      try {
        let startDate = body.startDate;
        let endDate = body.endDate;

        console.log(
          "startDate === " + startDate + " endDate ====== " + endDate
        );

        let totalPatients = await PatientModel.find({
          isTested: "Yes",
          location: { $in: body.locationId },
          createdDate: { $gte: startDate, $lt: endDate },
        }).exec();
        console.log(totalPatients);
        return response
          .status(200)
          .json({
            totalPatients,
            msg: "Total Tested patients found successfully",
          });
      } catch (err) {
        console.log(err);
        response.status(500).json({ errors: { msg: err } });
      }
    } else {
      response.status(500).json({ errors: { msg: "parameters are missing" } });
    }
  },

  getAllTestedPatientsOfLocationByDateRangeRelatedToJobId: async (
    request,
    response
  ) => {
    console.log(
      "======Get All Tested Patient Numbers Location Wise By Date Related To Job Id API ======="
    );
    console.log("=== Body Params: ===" + JSON.stringify(request.body));

    const body = JSON.parse(JSON.stringify(request.body));
    // check if all params are present
    if (body.startDate && body.endDate && body.locationId) {
      try {
        let startDate = body.startDate;
        let endDate = body.endDate;

        console.log(
          "startDate === " + startDate + " endDate ====== " + endDate
        );

        let user = await UserModel.findById(request.user.id);
        console.log("Admin Type is ====== " + user.type);
        console.log("Admin Id is ====== " + user._id);
        let empArray = [];
        let employees = await EmployeeModel.find(
          { createdBy: user._id },
          { _id: 1 }
        ).exec();

        employees.map((empId) => {
          empArray.push(empId._id);
        });
        console.log(empArray);

        let totalPatients = await PatientModel.find({
          isTested: "Yes",
          testedBy: { $in: empArray },
          location: { $in: body.locationId },
          createdDate: { $gte: startDate, $lt: endDate },
        }).exec();

        return response
          .status(200)
          .json({
            totalPatients,
            msg: "Total Tested patients found successfully",
          });
      } catch (err) {
        console.log(err);
        response.status(500).json({ errors: { msg: err } });
      }
    } else {
      response.status(500).json({ errors: { msg: "parameters are missing" } });
    }
  },

  getAllNewestUntestedPatients: async (request, response) => {
    console.log("====== UnTested Patient List  API =======");
    console.log("===== Query Params: =====");

    const { query } = request;
    const { skip, limit } = query;

    console.log(query);
    console.log("skip : " + skip + "and limit : " + limit);

    try {
      let user = await EmployeeModel.findById(request.user.id);
      console.log("Employee Admin Id is ====== " + user.createdBy);
      console.log("Employee Id is ====== " + user._id);
      // get All admin employees to get their patients
      let allEmployees = await EmployeeModel.find(
        { createdBy: user.createdBy },
        { _id: 1 }
      ).exec();
      let empArray = [];
      allEmployees.map((emp) => {
        empArray.push(emp._id);
      });

      let patients = await PatientModel.find({
        isTested: "No",
        createdBy: { $in: empArray },
      })
        .populate("testType", "name")
        .sort({ createdDate: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .exec();
      return response
        .status(200)
        .json({ patients, msg: "Untested patients found successfully" });
    } catch (err) {
      response.status(500).json({ errors: { msg: err } });
    }
  },

  getAllNewestTestedPatients: async (request, response) => {
    console.log("====== Tested Patient List  API =======");
    console.log("===== Query Params: =====");

    const { query } = request;
    const { skip, limit } = query;

    console.log(query);
    console.log("skip : " + skip + "and limit : " + limit);

    try {
      let user = await EmployeeModel.findById(request.user.id);
      console.log("Employee Admin Id is ====== " + user.createdBy);
      console.log("Employee Id is ====== " + user._id);
      let empType = await EmployeeTypeModel.findById(user.type);
      console.log("Employee Type is ====== " + empType.name);

      // check if login user is lab technician
      if (empType._id == "602217d598d003000450cf55") {
        // It is lab technicain type Id

        // get All admin employees to get their patients

        let patients = await PatientModel.find({
          isTested: "Yes",
          testType: {
            $in: ["603f35943ba47f2becaea1bb", "603f35d83ba47f2becaea1bc", '604af9620b8e4575c42e5fd6'],
          },
        })
          .populate("testType", "name")
          .sort({ createdDate: -1 })
          .skip(Number(skip))
          .limit(Number(limit))
          .exec();

        return response
          .status(200)
          .json({ patients, msg: "Tested patients found successfully" });
      } else {
        // get All admin employees to get their patients
        let allEmployees = await EmployeeModel.find(
          { createdBy: user.createdBy },
          { _id: 1 }
        ).exec();
        let empArray = [];
        allEmployees.map((emp) => {
          empArray.push(emp._id);
        });

        let patients = await PatientModel.find({
          isTested: "Yes",
          createdBy: { $in: empArray },
        })
          .populate("testType", "name")
          .sort({ createdDate: -1 })
          .skip(Number(skip))
          .limit(Number(limit))
          .exec();

        return response
          .status(200)
          .json({ patients, msg: "Tested patients found successfully" });
      }
    } catch (err) {
      console.log(err);
      response.status(500).json({ errors: { msg: err } });
    }
  },

  getAllOldestUntestedPatients: async (request, response) => {
    console.log("====== Oldest UnTested Patient List  API =======");
    console.log("===== Query Params: =====");

    const { query } = request;
    const { skip, limit } = query;

    console.log(query);
    console.log("skip : " + skip + "and limit : " + limit);

    try {
      let user = await EmployeeModel.findById(request.user.id);
      console.log("Employee Admin Id is ====== " + user.createdBy);
      console.log("Employee Id is ====== " + user._id);
      // get All admin employees to get their patients
      let allEmployees = await EmployeeModel.find(
        { createdBy: user.createdBy },
        { _id: 1 }
      ).exec();
      let empArray = [];
      allEmployees.map((emp) => {
        empArray.push(emp._id);
      });

      let patients = await PatientModel.find({
        isTested: "No",
        createdBy: { $in: empArray },
      })
        .sort({ createdDate: 1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .exec();
      return response
        .status(200)
        .json({ patients, msg: "Untested patients found successfully" });
    } catch (err) {
      response.status(500).json({ errors: { msg: err } });
    }
  },

  getAllOldestTestedPatients: async (request, response) => {
    console.log("======Oldest Tested Patient List  API =======");
    console.log("===== Query Params: =====");

    const { query } = request;
    const { skip, limit } = query;

    console.log(query);
    console.log("skip : " + skip + "and limit : " + limit);

    try {
      let user = await EmployeeModel.findById(request.user.id);
      console.log("Employee Admin Id is ====== " + user.createdBy);
      console.log("Employee Id is ====== " + user._id);
      let empType = await EmployeeTypeModel.findById(user.type);
      console.log("Employee Type is ====== " + empType);

      // check if login user is lab technician
      if (empType._id == "602217d598d003000450cf55") {
        // It is lab technicain type Id

        let patients = await PatientModel.find({
          isTested: "Yes",
          testType: {
            $in: ["603f35943ba47f2becaea1bb", "603f35d83ba47f2becaea1bc"],
          },
        })
          .sort({ createdDate: 1 })
          .skip(Number(skip))
          .limit(Number(limit))
          .exec();
        return response
          .status(200)
          .json({ patients, msg: "Tested patients found successfully" });
      } else {
        // get All admin employees to get their patients
        let allEmployees = await EmployeeModel.find(
          { createdBy: user.createdBy },
          { _id: 1 }
        ).exec();
        let empArray = [];
        allEmployees.map((emp) => {
          empArray.push(emp._id);
        });

        let patients = await PatientModel.find({
          isTested: "Yes",
          createdBy: { $in: empArray },
        })
          .sort({ createdDate: 1 })
          .skip(Number(skip))
          .limit(Number(limit))
          .exec();
        return response
          .status(200)
          .json({ patients, msg: "Tested patients found successfully" });
      }
    } catch (err) {
      response.status(500).json({ errors: { msg: err } });
    }
  },

  removePatient: async (request, response) => {
    console.log("====== Remove Patient API =======");
    try {
      const patient = await PatientModel.findById(request.params.id);

      if (!patient) {
        return response.status(400).json({ msg: "No Patient found" });
      } else {
        await patient.remove();
        response.status(200).json({ msg: "Patient Removed Successfully" });
      }
    } catch (err) {
      console.log(err);
      response.status(500).json({ errors: { msg: err } });
    }
  },

  getPatientById: async (request, response) => {
    console.log("====== Get Patient By Id API =======");

    try {
      const patient = await PatientModel.findById(request.params.id);

      if (!patient) {
        return response.status(400).json({ msg: "No Patient found" });
      } else {
        response
          .status(200)
          .json({ patient, msg: "Patient Found Successfully" });
      }
    } catch (err) {
      console.log(err);
      response.status(500).json({ errors: { msg: err } });
    }
  },

  updatePatientWithTested: async (request, response) => {
    console.log("====== Patient Record Updated with Tested API =======");
    console.log("=== Body Params: ===" + JSON.stringify(request.body));

    const body = JSON.parse(JSON.stringify(request.body));
    // check if all params are present
    if (body.patientId && body.employeeId) {
      try {
        let patient = await PatientModel.findOneAndUpdate(
          { _id: body.patientId },
          {
            $set: {
              isTested: "Yes",
              testedBy: body.employeeId,
              testedDate: Date.now(),
            },
          },
          { new: true }
        );
        console.log("Updated Tested Field : " + patient.isTested);

        let revenue = new RevenueModel({
          patientId: body.patientId,
          price: 120,
        });
        await revenue.save();
        response.status(200).json({
          msg: "Patient result updated with tested successfully",
        });
      } catch (err) {
        console.log(err);
        response.status(500).json({ errors: { msg: err } });
      }
    } else {
      response.status(500).json({ errors: { msg: "parameters are missing" } });
    }
  },

  getAllTestedPatientNumbers: async (request, response) => {
    console.log("======Get All Tested Patient Numbers  API =======");

    try {
      let locations = await LocationModel.find();

      let patients = await Promise.all(
        locations.map(async (location) => {
          let locationName = location.name;
          let count = await PatientModel.find({
            isTested: "Yes",
            location: location._id,
          })
            .count()
            .exec();
          return { locationName: locationName, total: count };
        })
      );
      let totalPatients = await PatientModel.find({ isTested: "Yes" })
        .count()
        .exec();
      return response
        .status(200)
        .json({
          patients,
          totalPatients,
          msg: "Total Tested patients found successfully",
        });
    } catch (err) {
      response.status(500).json({ errors: { msg: err } });
    }
  },

  getAllTestedPatientNumbersRelatedToJobId: async (request, response) => {
    console.log("======Get All Tested Patient Numbers By Job Id API =======");

    try {
      let user = await UserModel.findById(request.user.id);
      console.log("Admin Type is ====== " + user.type);
      console.log("Admin Id is ====== " + user._id);
      console.log("Admin Locations: ====== " + user.locations);
      let empArray = [];
      let employees = await EmployeeModel.find(
        { createdBy: user._id },
        { _id: 1 }
      ).exec();
      employees.map((empId) => {
        empArray.push(empId._id);
      });
      console.log("empArray");
      console.log(empArray);
      let locations = await LocationModel.find({
        _id: { $in: user.locations },
      });
      console.log("locations");
      console.log(locations);
      let patients = await Promise.all(
        locations.map(async (location) => {
          let locationName = location.name;
          let count = await PatientModel.find({
            isTested: "Yes",
            location: location._id,
            testedBy: { $in: empArray },
          })
            .count()
            .exec();
          return { locationName: locationName, total: count };
        })
      );

      let totalPatients = await PatientModel.find({
        isTested: "Yes",
        testedBy: { $in: empArray },
      })
        .count()
        .exec();

      return response
        .status(200)
        .json({
          patients,
          totalPatients,
          msg: "Total Tested patients found successfully",
        });
    } catch (err) {
      response.status(500).json({ errors: { msg: err } });
    }
  },

  downloadFile: async (request, response) => {
    var https = require("https");
    var fs = require("fs");
    var request = require("request");
    var accessToken =
      "dz77RB7UPnwAAAAAAAAAAWYsGnqED52Xv3Pd_Gxxm32SYotYdTXY4MQ4L3wpy85-";

    let signature =
      "https://www.dropbox.com/s/vt4jd0s7w6ibbzh/IMAGE-1613042889518.pdf?dl=0";
    let covidTestForm =
      "https://www.dropbox.com/s/qgfncy6lk40aapn/IMAGE-1613042889472.pdf?dl=0";
    let patientTestResultSignOff =
      "https://www.dropbox.com/s/2f6r2qgsp6bw7jf/IMAGE-1613042889498.pdf?dl=0";
    let uuid = "123";
    let path = "./public/uploads/";
    let signatureFileName = `signature-${uuid}.pdf`;
    let signatureFileNameWithPath = `${path}signature-${uuid}.pdf`;
    let covidTestFormFileName = `covidTestFormFile-${uuid}.pdf`;
    let covidTestFormFileNameWithPath = `${path}covidTestFormFile-${uuid}.pdf`;
    let patientTestResultSignOffFileName = `patientTestResultSignOff-${uuid}.pdf`;
    let patientTestResultSignOffFileNameWithPath = `${path}patientTestResultSignOff-${uuid}.pdf`;

    if (signature) {
      let firstPart = signature.split("=")[0];
      signature = firstPart + "=1";
      let stream1 = request(signature, {
        auth: { bearer: accessToken },
      }).pipe(fs.createWriteStream(signatureFileNameWithPath));
      stream1.on("finish", function () {
        if (covidTestForm) {
          let firstPart = covidTestForm.split("=")[0];
          covidTestForm = firstPart + "=1";
          let stream2 = request(covidTestForm, {
            auth: { bearer: accessToken },
          }).pipe(fs.createWriteStream(covidTestFormFileNameWithPath));

          stream2.on("finish", function () {
            if (patientTestResultSignOff) {
              let firstPart = patientTestResultSignOff.split("=")[0];
              patientTestResultSignOff = firstPart + "=1";
              let stream3 = request(patientTestResultSignOff, {
                auth: { bearer: accessToken },
              }).pipe(
                fs.createWriteStream(patientTestResultSignOffFileNameWithPath)
              );
              stream3.on("finish", function () {
                // send email
                helper.patientCreateEmail(
                  signatureFileName,
                  signatureFileNameWithPath,
                  covidTestFormFileName,
                  covidTestFormFileNameWithPath,
                  patientTestResultSignOffFileName,
                  patientTestResultSignOffFileNameWithPath
                );
              });
            }
          });
        }
      });
    }
  },
};

const createCsvWriter = require("csv-writer").createObjectCsvWriter;

var cron = require("node-cron");
const { ConnectionStates } = require("mongoose");
const { ObjectId } = require("bson");
const testResultSignOff = require("../public/Pdf/testResultSignoff");
const { discriminator } = require("../models/Location");
const MasterPDf = require("../public/Pdf/MasterPdf");
const puppeteer = require('puppeteer');
const download = require('download');

const Noptions = {
  density: 100,
  saveFilename: "untitled",
  savePath: "./images",
  format: "png",
  width: 600,
  height: 600
};

//task.start();

const generatePdf = async () => {

  console.log("----fetching all patieints");
  let patients = await PatientModel.find({}).limit(1);
  console.log("-----fetch done  =>>> ", patients.length);
  console.log("starting pdf creation process");
  // var allData = "";
  const doc = new PDFDocument;
  //   const browser = await puppeteer.launch({
  //     headless: false
  // });

  doc.pipe(fs.createWriteStream('all_patients.pdf'));
  let count = 0
  function create(e, i) {
    return new Promise(async (resolve) => {
      if (e.idIMage) {
        doc
          .addPage()
        doc.image(e.idIMage, 0, 15, { width: 600 })
          .text('Id', 38, 38);
      }
      const covidTest = await downloader(e.covidTestForm)
      const image = await fromBuffer(covidTest, Noptions).convert(1, true)
      console.log("image ====> ", image)
      // const page = await browser.newPage();
      // await page.goto(e.covidTestForm  + '&raw=1',  {waitUntil: 'load', timeout: 0});
      // let covidTest = await page.screenshot({ path: 'example.png', fullPage: true  });
      // await page.goto(e.patientTestResultSignOff  + '&raw=1',  {waitUntil: 'load', timeout: 0});
      // let patientSignOff = await page.screenshot({ path: 'example.png',fullPage: true  });
      if (covidTest) {
        console.log("Adding test for=> ", i)
        doc
          .addPage()
        doc.image(image, 0, 15, { width: 600 })
          .text('covid test form', 38, 38);
      }
      // if (patientSignOff) {
      //   console.log("Adding form for=> ", i)
      //   doc
      //     .addPage()
      //   doc.image(patientSignOff, 0, 15, { width: 600 })
      //     .text('patientTestResultSignOff', 38, 38);
      // };
      if (e.idIMage) {
        doc
          .addPage()
        doc.image(e.idIMage + '&raw=1', 0, 15, { width: 600 })
          .text('id', 38, 38);
      }
      console.log("done=> ", i)
      resolve(true)
    });
  }

  if (patients.length) {
    await new Promise((resolve) => {
      patients.forEach(async (e, i) => {
        try {
          console.log("creating html of => ", i);
          const res = await create(e, i);
          console.log("res===", res)
          console.log("loop finish for => ", i)
        } catch (err) {
          console.log(err);
        } finally {
          // most important is here
          count += 1
          if (count == patients.length) {
            resolve()
          }
        }
      })
    })
  };

  console.log("----genrating master pd----");
  // let pdfGenerateor = {
  //   content: master
  // };
  console.log("generating pdf-=-=-=-=-===")
  doc.end();
  browser.close();
  // html_to_pdf.generatePdf(pdfGenerateor, options).then(async (pdfBuffer) => {
  //   console.log("Writing Generated pdf");
  //   fs.writeFile("all_patients.pdf", pdfBuffer, function read(err, data) {
  //     if (err) {
  //       console.log("error occured", err);
  //       return
  //     } else {
  //       console.log("All done ", master);
  //     }
  //   });
  // })
  // console.log(master)
  // console.log("Generating pdf--------");
  // console.log(patients)
};

// generatePdf();

// const downloader = (f) => {
//   return new Promise((res) => {
//     let firstPart = f.split("=")[0];
//     firstPart = firstPart + "=1";
//     const file = firstPart;
//     // Path at which image will get downloaded
//     const filePath = `meta`;

//     download(file, filePath)
//       .then((e) => {
//         console.log('Download Completed ', e);
//         res(e)
//       })
//   })
// }


module.exports = patientController;


// if (patients.length) {
//   patients.forEach(async (e, i) => {
//     console.log("creating html of => ", i);
//     var template = patinetDataTemplate("", "", e.fullname);
//     allData += template;
//     if (e.idIMage) {
//       template = patinetDataTemplate("Id", e.idImage + "&raw=1");
//       allData += template;
//     }
//     if (e.insuranceImage) {

//       template = patinetDataTemplate("Insurance", e.insuranceImage + "&raw=1", "");
//       allData += template;
//     }
//     if (e.covidTestForm) {
//       const page = await browser.newPage();
//       await page.goto(e.covidTestForm);
//      const res = await page.screenshot({ path: 'meta/example.png' });
//       console.log("Result==>", res);
//       template = patinetDataTemplate("Covid Test Form", 'meta/example.png', "");
//       allData += template;
//     }
//     if (e.patientTestResultSignOff) {
//       template = patinetDataTemplate("Sign off", e.patientTestResultSignOff + "&raw=1", "");
//       allData += template;
//     }
//     if (e.docPrescription) {
//       template = patinetDataTemplate("Doc Description", e.docPrescriptionUrl + "&raw=1", "");
//       allData += template;
//     }

//   })
// };