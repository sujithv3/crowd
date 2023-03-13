const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const res = require("express/lib/response");

const sendEmail = async (
  email: string,
  subject: string,
  payload: any,
  template?: string,
  action_name = "click to proceed"
) => {
  try {
    const transporter = nodemailer.createTransport({
      // host: process.env.HOST,
      service: "gmail",
      port: 587,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    // const source = fs.readFileSync(path.join(__dirname, template), "utf8");
    // const compiledTemplate = handlebars.compile(source);
    let option = {
      from: {
        name: process.env.FROM_MAIL,
        address: process.env.MAIL_USER,
      },
      to: email,
      subject: subject,
      html: `<a style="background:#46a4e3; padding-top:20px,padding-bottom:20px,padding-left:20px,padding-right:20px" href="${payload.link}">${action_name}</a>`,
    };
    let result = await transporter.sendMail(option);
  } catch (error) {
    console.log(error);
    return error;
  }
};
module.exports = sendEmail;
