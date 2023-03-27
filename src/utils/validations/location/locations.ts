import { body } from "express-validator";

// validations for user
const locationValidation = [
  body("name")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("name is required"),
  body("location_type")
    .isString()
    .withMessage("location_type must be string")
    .notEmpty()
    .withMessage("location_type is required"),
  body("country")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("country is required"),
];

module.exports = locationValidation;
