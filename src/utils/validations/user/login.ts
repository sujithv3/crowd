import { body } from "express-validator";

// validations for login
const loginValidationEdit = [
  body("email")
    .isEmail()
    .withMessage("email id is must")
    .notEmpty()
    .withMessage("email is required"),
  body("password")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("password is required"),
  body("role")
    .isInt()
    .withMessage("must be number")
    .notEmpty()
    .withMessage("role is required"),
];

module.exports = loginValidationEdit;
