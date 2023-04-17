import { body } from "express-validator";

// validations for user
const StagingValidation = [
  body("name")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("name is required"),
];

module.exports = StagingValidation;
