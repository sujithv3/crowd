const NodeMailer = require("nodemailer");
const Handlebar = require("handlebars");
import { Cms } from "../../entity/cms";
import { AppDataSource } from "../../data-source";

const emailTemplate = async (email: string, content_template: string, payload: any, mail_template: string = 'mail_template1') => {
  try {
    const cmsRepository = AppDataSource.getRepository(Cms);
    // const source = emailFs.readFileSync(
    //   emailPath.resolve(__dirname, "./../templates/registeration.handlebars"),
    //   "utf-8"
    // );

    const mailTemplate = await cmsRepository
      .createQueryBuilder()
      .select('content')
      .where("tag=:template AND type='MAIL TEMPLATE'", {
        template: mail_template
      })
      .getRawOne();

    const source = mailTemplate.content;

    const template = Handlebar.compile(source);

    const contentTemplate = await cmsRepository
      .createQueryBuilder()
      .select(['content', 'title'])
      .where("tag=:template AND type='MAIL'", {
        template: content_template
      })
      .getRawOne();
    const subject = contentTemplate.title;

    const template_content = contentTemplate.content;

    // if (contentTemplate.html === 0) {
    //   template_content = '<div style="white-space: break-spaces;">' + template_content + '</div>';
    // }


    const htmlTemplate = template({ content: template_content, html: true });



    // console.log("HTML TEMPLATES", htmlTemplate);

    const template2 = Handlebar.compile(htmlTemplate);

    const mailContent = template2(payload);

    // const source = fs.readFileSync(path.join(__dirname, template), "utf8");
    // const compiledTemplate = handlebars.compile(source);

    const transporter = NodeMailer.createTransport({
      // host: process.env.HOST,
      service: "gmail",
      port: 587,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let option = {
      from: {
        name: process.env.FROM_MAIL,
        address: process.env.MAIL_USER,
      },
      to: email,
      subject: subject,
      html: mailContent,
    };
    let result = await transporter.sendMail(option);
  } catch (error) {
    console.log(error);
    return error;
  }
};
module.exports = emailTemplate;
