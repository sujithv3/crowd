import { body } from "express-validator";

// validations for user
const roleValidation = [
  body("name")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("first_name is required"),
];

module.exports = roleValidation;
