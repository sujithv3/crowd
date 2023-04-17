import { body } from "express-validator";

// validations for user
const mobileOTPSend = [
  body("contact_number").notEmpty().withMessage("contact_number is required"),
];

const verifyMobileOTP = [
  body("contact_number").notEmpty().withMessage("contact_number is required"),
  body("otp").notEmpty().withMessage("otp is required"),
];

const emailOTPSend = [
  body("email_id")
    .isEmail()
    .withMessage("email_id id is must")
    .notEmpty()
    .withMessage("email_id is required"),
];
const emailOTPverify = [body("otp").notEmpty().withMessage("otp is required")];

module.exports = {
  mobileOTPSend,
  verifyMobileOTP,
  emailOTPSend,
  emailOTPverify,
};
