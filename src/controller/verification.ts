import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
const { genToken } = require("../utils/jsonwebtoken");
const msg = require("../configs/message");
const Jwt = require("../utils/jsonwebtoken");
const sendEmail = require("../utils/nodemailer/email");
const responseMessage = require("../configs/response");
import { Users } from "../entity/Users";
const client = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.ACCOUNT_AUTH_TOKEN
);

export class Verifications {
  private userRepository = AppDataSource.getRepository(Users);

  // send verification code for mobile number
  async sendMobileVerificationCode(
    req: any,
    res: Response,
    next: NextFunction
  ) {
    try {
      await client.verify.v2
        .services(process.env.SERVICE_TOKEN)
        .verifications.create({
          to: `+${req.body.contact_number}`,
          channel: "sms",
        })
        .then((verification) => console.log(verification.status));

      return responseMessage.responseMessage(true, 200, msg.otpSendYourMobile);
    } catch (error) {
      responseMessage.responseWithData(
        false,
        400,
        msg.otpSendYourMobileFailed,
        error
      );
    }
  }

  //   verify mobile otp
  async verifyMobileVerificationCode(
    req: any,
    res: Response,
    next: NextFunction
  ) {
    await client.verify.v2
      .services(process.env.SERVICE_TOKEN)
      .verificationChecks.create({
        to: `+${req.body.contact_number}`,
        code: req.body.otp,
      })
      .then((data) => {
        if (!data.valid) {
          return res.send(
            responseMessage.responseMessage(false, 400, msg.invalidOTP)
          );
        }
        return res.send(
          responseMessage.responseMessage(true, 200, msg.verifySuccess)
        );
      })
      .catch((err) => {
        return res.send(
          responseMessage.responseWithData(false, 400, msg.verifyOTPFailed, err)
        );
      });
  }

  //   send code for email
  async sendEMailVerificationCode(req: any, res: Response, next: NextFunction) {
    try {
      const code = Math.floor(100000 + Math.random() * 900000);

      const user = Jwt.decode(req.cookies.token);

      await this.userRepository
        .createQueryBuilder()
        .update(Users)
        .set({
          email_otp: `${code}`,
        })
        .where("id =:id", { id: user[0].id })
        .execute();

      await sendEmail(
        req.body.email_id,
        "Your verification code is " + code,
        "",
        ""
      );

      return responseMessage.responseMessage(true, 200, msg.otpSendYourEmail);
    } catch (error) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.otpSendYourMobileFailed,
        error
      );
    }
  }

  //   verify email otp
  async verifyEMailVerificationCode(
    req: any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = Jwt.decode(req.cookies.token);

      const userDetail = await this.userRepository
        .createQueryBuilder()
        .where("id =:id", { id: user[0].id })
        .getOne();

      if (userDetail.email_otp != req.body.otp) {
        return responseMessage.responseMessage(false, 400, msg.invalidOTP);
      }
      return responseMessage.responseMessage(true, 200, msg.verifySuccess);
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.verifyOTPFailed,
        JSON.stringify(err)
      );
    }
  }
}
