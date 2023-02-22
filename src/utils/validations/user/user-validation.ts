import { body } from "express-validator";

// validations for user
const signupValidation = [
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
  body("password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("must be at least 6 chars long")
    .matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/)
    .withMessage(
      "Password should be combination of one uppercase , one lower case, one special char, one digit and min 8 , max 20 char long"
    ),
];

module.exports = signupValidation;
