import { body } from "express-validator";

// validations for change password
const changePasswordValidation = [
  body("old_password").isString().withMessage("old password is required"),
  body("new_password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("must be at least 6 chars long")
    .matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/)
    .withMessage(
      "Password should be combination of one uppercase , one lower case, one special char, one digit and min 8 , max 20 char long"
    )
];

const createPasswordValidation = [
  body("password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("must be at least 6 chars long")
    .matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/)
    .withMessage(
      "Password should be combination of one uppercase , one lower case, one special char, one digit and min 8 , max 20 char long"
    ),
];

const forgetPasswordValidation = [
  body("email_id").isEmail().notEmpty().withMessage("email_id is required"),
];

module.exports = {
  changePasswordValidation,
  createPasswordValidation,
  forgetPasswordValidation,
};
