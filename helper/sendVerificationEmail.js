const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
async function main(email, verifyURL) {
  // create reusable transporter object
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "silversnakes2000@gmail.com", //  user
      pass: "rampagefailure", // password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: "FooDux <silversnakes2000@gmail.com>", // sender address
    to: email, // list of receivers
    subject: "[FooDux] - Please Verify Your Account", // Subject line
    html: `<html>
            <head>
                <style>
                    h2 {
                    background-color: #22bf6c;
                    color: white;
                    padding: 10px 0px;
                    text-align: center;
                    }
                    p {
                    font-size: 17px;
                    color: #a9a9a9;
                    }
                    h6 {
                    font-size: 20px;
                    }
                    button {
                    background-color: #22bf6c;
                    border: none;
                    color: white;
                    padding: 7px 15px;
                    border-radius: 10px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px;
                    margin: 4px 2px;
                    cursor: pointer;
                    }
                    button:hover {
                    background-color: #1da15a;
                    }
                    a{
                    text-decoration: none;
                    color: white !important;
                    }
                </style>
            </head>
            <body>
                <div>
                <h2>FooDux - Account Verification</h2>
                <p>
                We appreciate that you register at FooDux. Verify you account so that
                you get all the updates regarding best food at your desired price. Now
                you can have a great appetite with any amount in your pocket. At FooDux,
                it becomes easier to know your a place to eat with best cuisine. Help us
                to grow bigger!
                </p>
                <h6>Click on the button to verify your email...</h6>
                <button ><a href=${verifyURL} target="_blank">Verify Email</a></button>
            </div>
            </body>
        </html>`, // html body
  });
}

module.exports = {
  sendMail: main,
};
