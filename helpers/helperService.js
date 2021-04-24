const nodemailer = require('nodemailer');
var handlebars = require('handlebars');
var fs = require('fs');
var pdf = require('html-pdf');

const csv = require('csv-parser')

var transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "healthcareproviderlab@gmail.com",
        pass: "HealthcareProvidersLab@1234"
    }
});


var readHTMLFile = function (path, callback) {
    fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
        if (err) {
            throw err;
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};


const helper = {

    awaitingAdminApprovalEmail(user) {

        readHTMLFile('./public/template/registrationEmail.html', function (err, html) {

            var template = handlebars.compile(html);
            var replacements = {
                username: user.firstname + ' ' + user.lastname
            }
            var htmlToSend = template(replacements);

            // setup e-mail data with unicode symbols
            const mailOptions = {
                from: '"HealthCare Providers Laboratory Support" <healthcareproviderlab@gmail.com>', // sender address
                to: user.email, // list of receivers
                subject: 'Awaiting Admin Approval', // Subject line
                text: '', // plaintext body
                html: htmlToSend // html body
            };
            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log(`Message sent: ${info.response}`);
            });
        });
    },

    activationEmail(user) {

        readHTMLFile('./public/template/accountActivationEmail.html', function (err, html) {

            var template = handlebars.compile(html);
            var replacements = {
                username: user.firstname + ' ' + user.lastname
            }
            var htmlToSend = template(replacements);

            // setup e-mail data with unicode symbols
            const mailOptions = {
                from: '"HealthCare Providers Laboratory Support" <healthcareproviderlab@gmail.com>', // sender address
                to: user.email, // list of receivers
                subject: 'Registration Approved Email', // Subject line
                text: '', // plaintext body
                html: htmlToSend // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log(`Message sent: ${info.response}`);
            });
        });

    },

    forgotPassword(user, server, key) {

        readHTMLFile('./public/template/forgotPassword.html', function (err, html) {

            var template = handlebars.compile(html);
            var replacements = {
                username: user.fullname,
                server: server,
                key: key,
                id: user._id
            }
            var htmlToSend = template(replacements);

            // setup e-mail data with unicode symbols
            const mailOptions = {
                from: '"HealthCare Providers Laboratory Support" <healthcareproviderlab@gmail.com>', // sender address
                to: user.email, // list of receivers
                subject: 'Forgot Password Email', // Subject line
                text: '', // plaintext body
                html: htmlToSend // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log(`Message sent: ${info.response}`);
            });
        });

    },

    testResultEmail(emailTemplate, user, location) {

        readHTMLFile('./public/template/' + emailTemplate, function (err, html) {

            var template = handlebars.compile(html);
            var replacements = {
                username: user.firstname + ' ' + user.lastname,
                location: location,
            }
            var htmlToSend = template(replacements);

            // setup e-mail data with unicode symbols
            const mailOptions = {
                from: '"HealthCare Providers Laboratory Support" <healthcareproviderlab@gmail.com>', // sender address
                to: user.email, // list of receivers
                subject: 'COVID-19 Test Result', // Subject line
                text: '', // plaintext body
                html: htmlToSend // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log(`Message sent: ${info.response}`);
            });

        });

    },

    sendToBilling(emailTemplate, user, location) {


        fs.createReadStream('./file.csv')
            .pipe(csv())
            .on('data', (row) => {
                // console.log(row);
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
                const mailOptions = {
                    from: '"HealthCare Providers Laboratory Support" <healthcareproviderlab@gmail.com>', // sender 
                    to: ['email@email.com'],// list of receivers
                    // to: ['healthcareproviderslab@gmail.com'],// list of receivers
                    subject: 'HealthCare Providers Laboratory COVID-19 TEST', // Subject line
                    text: '', // plaintext body
                    attachments: [
                        {   // file on disk as an attachment
                            filename: 'data.csv',
                            path: './file.csv' // stream this file
                        },
                    ],
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log(info);
                    console.log(`Message sent: ${info.response}`);
                });
            });

            fs.createReadStream('./mail.csv')
            .pipe(csv())
            .on('data', (row) => {
                // console.log(row);
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
                const mailOptions = {
                    from: '"HealthCare Providers Laboratory Support" <healthcareproviderlab@gmail.com>', // sender 
                    to: ['email@email.com'],// list of receivers
                    // to: ['healthcareproviderslab@gmail.com'],// list of receivers
                    subject: 'HealthCare Providers Laboratory COVID-19 TEST', // Subject line
                    text: '', // plaintext body
                    attachments: [
                        {   // file on disk as an attachment
                            filename: 'mail.csv',
                            path: './mail.csv' // stream this file
                        },
                    ],
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log(info);
                    console.log(`Message sent: ${info.response}`);
                });
            });

    },

    patientCreateEmail(user, htmlTemplate, signatureFileName, signatureFileNameWithPath, covidTestFormFileName, covidTestFormFileNameWithPath, patientTestResultSignOffFileName, patientTestResultSignOffFileNameWithPath) {


        readHTMLFile('./public/template/' + htmlTemplate, function (err, html) {

            var template = handlebars.compile(html);
            var replacements = {
                username: user?.firstname + ' ' + user?.lastname,
            }
            var htmlToSend = template(replacements);

            // setup e-mail data with unicode symbols
            const mailOptions = {
                from: '"HealthCare Providers Laboratory Support" <healthcareproviderlab@gmail.com>', // sender address
                to: user.email, // list of receivers
                subject: 'HealthCare Providers Laboratory COVID-19 TEST', // Subject line
                text: '', // plaintext body
                attachments: [
                    {   // file on disk as an attachment
                        filename: signatureFileName,
                        path: signatureFileNameWithPath // stream this file
                    },
                    {   // file on disk as an attachment
                        filename: covidTestFormFileName,
                        path: covidTestFormFileNameWithPath, // stream this file
                        contentType: 'application/pdf'
                    },
                    {   // file on disk as an attachment
                        filename: patientTestResultSignOffFileName,
                        path: patientTestResultSignOffFileNameWithPath // stream this file
                    }
                ],
                html: htmlToSend // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log(info);
                console.log(`Message sent: ${info.response}`);
            });

        });

    },

    sendPatientsPDFsForMail(emailPDF, emailPDFWithPath, signatureFileName, signatureFileNameWithPath, covidTestFormFileName, covidTestFormFileNameWithPath, patientTestResultSignOffFileName, patientTestResultSignOffFileNameWithPath) {

        readHTMLFile('./public/template/sendPdfsAsMailToPatient.html', function (err, html) {

            var template = handlebars.compile(html);
            var replacements = {
                username: "Daisy",
            }
            var htmlToSend = template(replacements);


            // setup e-mail data with unicode symbols
            const mailOptions = {
                from: '"HealthCare Providers Laboratory Support" <healthcareproviderlab@gmail.com>', // sender address
                to: 'artin.sinani@gmail.com', // list of receivers
                subject: 'Patients PDFs To Send via Mail', // Subject line
                text: '', // plaintext body
                attachments: [
                    {   // file on disk as an attachment
                        filename: emailPDF,
                        path: emailPDFWithPath // stream this file
                    },
                    {   // file on disk as an attachment
                        filename: signatureFileName,
                        path: signatureFileNameWithPath // stream this file
                    },
                    {   // file on disk as an attachment
                        filename: covidTestFormFileName,
                        path: covidTestFormFileNameWithPath, // stream this file
                        contentType: 'application/pdf'
                    },
                    {   // file on disk as an attachment
                        filename: patientTestResultSignOffFileName,
                        path: patientTestResultSignOffFileNameWithPath // stream this file
                    }
                ],
                html: htmlToSend // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log(info);
                console.log(`Message sent: ${info.response}`);
            });

        });

    },

    dateFormat() {
        let date = new Date();
        let month = date.getMonth() + 1;
        if (month < 10) {
            month = `0${month}`;
        }
        let day = (date.getDate());
        if (day < 10) {
            day = `0${day}`;
        }

        //	date.setDate(date.getDate()+adds)
        return `${date.getFullYear()}${month}${day}`;
        //	return Math.ceil(date.getTime()/1000)
    },

    nextDate(val) {
        let date = new Date(val);
        let month = date.getMonth() + 1;
        if (month < 10) {
            month = `0${month}`;
        }
        let day = date.getDate() + 1;
        if (day < 10) {
            day = `0${day}`;
        }
        return `${date.getFullYear()}-${month}-${day}`;
    },

    getThisMonthFirstDate(val) {
        let date = new Date(val);
        let month = date.getMonth() + 1;
        if (month < 10) {
            month = `0${month}`;
        }
        let day = date.getDate() + 1;
        if (day < 10) {
            day = `0${day}`;
        }
        return `${date.getFullYear()}-${month}-01`;
    },

    getNextMonthFirstDate(val) {
        let date = new Date(val);
        let year = date.getFullYear();
        let month = date.getMonth() + 2;
        if (month < 10) {
            month = `0${month}`;
        }
        if (month > 12) {
            month = `01`;
            year = year + 1;
        }

        return `${year}-${month}-01`;
    },

    sendTextMessages(user, result, test) {

        const accountSid = "ACd6ae3c1effc301db67d4ad446d3ebcb1";
        const authToken = "9fad49a2a0bb8976c01e66b0b4729f1a";
        const client = require('twilio')(accountSid, authToken);

        console.log("Number to Send " + user.phone);

        if (result == "Positive") {
            let text = `Hi ${user.fullname},\n` +
                `Your ${test} results are now available. \n` +
                `Please retrieve your test results via the email provided upon signing up.  \n\n` +
                ' \n\n' +
                'For more information about your results please feel free to call us: +1 (626) 813 - 3800\n';
            client.messages
                .create({
                    body: text,
                    from: '+19103874951',
                    to: user.phone
                })
                .then(message => {
                    console.log(message);
                    console.log(message.sid);
                });
        }

        if (result == "Negative") {
            let text = `Hi ${user.fullname},\n` +
                `Your ${test} are now available. \n` +
                `Please retrieve your test results via the email provided upon signing up.  \n\n` +
                ' \n\n' +
                'For more information about your results please feel free to call us: +1 (626) 813 - 3800\n';
            client.messages
                .create({
                    body: text,
                    from: '+19103874951',
                    to: user.phone
                })
                .then(message => {
                    console.log(message);
                    console.log(message.sid);
                });
        }


    },

    sendCodeViaText(userPhone, code) {
        console.log("conde to send===", code);
        const accountSid = "ACd6ae3c1effc301db67d4ad446d3ebcb1";
        const authToken = "9fad49a2a0bb8976c01e66b0b4729f1a";
        const client = require('twilio')(accountSid, authToken);

        console.log("Number to Send " + userPhone);

        let text =  `${code} is your verification code \n`;

        client.messages
            .create({
                body: text,
                from: '+19103874951',
                to: userPhone
            })
            .then(message => {
                console.log(message);
                console.log(message.sid);
            });

    },

    sendTextMessagesForUUID(user, uuid) {

        const accountSid = "ACd6ae3c1effc301db67d4ad446d3ebcb1";
        const authToken = "9fad49a2a0bb8976c01e66b0b4729f1a";
        const client = require('twilio')(accountSid, authToken);

        console.log("Number to Send " + user.phone);

        let text = `Hi ${user.fullname},\n` +
            `Please present this Patient Identification Number (PID) ${uuid}, to the Registered Nurse, once it is your turn. \n`;
        client.messages
            .create({
                body: text,
                from: '+19103874951',
                to: user.phone
            })
            .then(message => {
                console.log(message);
                console.log(message.sid);
            });

    },

}

module.exports = helper;
