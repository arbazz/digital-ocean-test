
const signaturePdf = (
    signature,
    date,
    name,
    phone,
    email,
    birth,
    sex
) => {

    return(
        `<!DOCTYPE html>
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
                .around {
                    display: flex;
                    width: '100%';
                    justify-content: space-between;
                    font-size: 18;
                }
            </style>
        </head>
        
        <body>
            <div class="conteinare">
                <img class="img" src="../images/logo.png" />
                <h2>Healthcare Provider Labs</h2>
                <h1>Information</h1>
                <div style="width: 80%">
                    <div class="around">
                        <p>Full Name: </p>
                        <p>${name}</p>
                    </div>
                    <div class="around">
                        <p>Phone: </p>
                        <p>${phone}</p>
                    </div>
                    <div class="around">
                        <p>Email: </p>
                        <p>${email}</p>
                    </div>
                    <div class="around">
                        <p>Date of birth: </p>
                        <p>${birth}</p>
                    </div>
                    <div class="around">
                        <p>Sex: </p>
                        <p>${sex}</p>
                    </div>
                </div>
                <img src="${signature}" />
                <p>${date}</p>
            </div>
        </body>
        
        </html>`
    )
}

module.exports = signaturePdf;