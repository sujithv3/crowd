import { body } from "express-validator";

// validations for user
const paymentVerificationCampaignValidation = [
  body("status")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("status is required"),
  body("contact_email_id")
    .isEmail()
    .withMessage("must be email")
    .notEmpty()
    .withMessage("contact_email_id is required"),
  body("business_type")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("business type is required")
    .isIn(["BUSINESS", "INDIVIDUAL"])
    .withMessage(" invalid value"),
];

module.exports = paymentVerificationCampaignValidation;
