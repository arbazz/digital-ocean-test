

const testResultSignOff = (fullname, location, number, data, signature) => {

    return(
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
                <h1>Patient’s Test Results Sign Off</h1>
                <div>
                    <p style="padding: 30px;">
                    Derived on privacy pursuant to the Federal Health Insurance Portability and Accountability Act of 1996 (“HIPAA”).
                    </p>
                    <p style="padding: 30px;">
                    I, ${fullname}, certify that I am indeed the person coinciding with the COVID-19 test and corresponding results to follow.
                      </p>
                      <p>
                      I am satisfied with the testing procedure given by Health Care Providers Laboratory.
                    </p>
                    <p>
                    Located at: ${location}
                    </p>
                    <p>
                    Phone Number: ${number}
                    </p>
                </div>
            </div>
            <img src="${signature}" />
            <p>${data}</p>
        </body>
        
        </html>`
    )
};

module.exports = testResultSignOff;