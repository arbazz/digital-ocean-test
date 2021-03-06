

const consentForm = (fullname,date,signature) => {

    return (
        ` <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Id</title>
    <style>
        .img {

        }

        .conteinare {
            display: flex;
            align-items: center;
            height: 100vh;
            flex-direction: column;
            margin-top: 30px;
        }
    </style>
</head>

<body>
    <div class="conteinare">
        <img class="img" src="../images/logo.png" />
        <h2>Healthcare Provider Labs</h2>
        <h1>COVID 19 Testing Consent Form</h1>
        <div>
            <p style="padding: 30px;">I ${fullname} give permission for HEALTH CARE PROVIDERS LABORATORY
                staff to perform a COVID-19 test on me. The testing process has

                been explained to me and I have had an opportunity to ask any ques-
                tions I may have. I acknowledge that HEALTHCARE PROVIDERS

                LABORATORY cannot guarantee the accuracy of the result and that
                it may be necessary for me to undergo additional testing in the
                future. I recognize that even if I have a negative result now, I can
                still contract COVID-19 in the future. Administering the test does
                not create a patient/physician relationship between me and HEALTH
                CARE PROVIDERS LABORATORY or any of its employees, nor
                does it obligate HEALTH CARE PROVIDERS LABORATORY or its
                staff to perform any other care or treatment for me.

            </p>
            <p style="padding: 30px;">
                I, authorize HEALTH CARE PROVIDERS LABORATORY to receive
                my test results and convey them to me. I understand by undergoing
                the test HEALTH CARE PROVIDERS LABORATORY may have to
                report the results to the Department of Health or other agencies.
            </p>
        </div>
    </div>
    <img src='${signature}' />
    <p>${date}</p>
</body>

</html>`
    )
};

module.exports = consentForm;