import { body } from "express-validator";

// validations for user
const signupValidationEdit = [
  body("first_name")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("first_name is required"),
  body("last_name")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("last_name is required"),
  body("email_id").isEmail().notEmpty().withMessage("email is required"),
  body("contact_number").notEmpty().withMessage("contact_number is required"),
  body("country")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("country is required"),
];

module.exports = signupValidationEdit;
