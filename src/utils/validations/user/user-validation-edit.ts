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
  body("code")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("code is required"),
  body("street_name").isString().withMessage("must be string").optional(),
  body("country")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("country is required"),
  body("description")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("description is required"),
  body("summary")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("summary is required"),
  body("linked_in").isString().withMessage("must be string").optional(),
  body("facebook").isString().withMessage("must be string").optional(),
  body("twitter").isString().withMessage("must be string").optional(),
  body("you_tube").isString().withMessage("must be string").optional(),
  body("website").isString().withMessage("must be string").optional(),
];

module.exports = signupValidationEdit;
