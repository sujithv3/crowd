import { body, check } from "express-validator";

// validations for user
const bankCampaignValidation = [
  body("transit_number")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("transit_number is required"),

  body("finance_number")
    .isInt()
    .withMessage("must be number")
    .notEmpty()
    .withMessage("finance_number is required"),
  body("bank_name")
    .isInt()
    .withMessage("must be number")
    .notEmpty()
    .withMessage("bank_name is required"),
  body("account_number")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("account_number is required"),
  body("swift")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("swift is required"),
  body("bank_address")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("bank_address is required"),
  body("bank_location")
    .isInt()
    .withMessage("must be number")
    .notEmpty()
    .withMessage("bank_location is required"),
];

module.exports = bankCampaignValidation;
