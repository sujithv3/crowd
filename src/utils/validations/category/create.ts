import { body } from "express-validator";

// validations for user
const categoryValidation = [
  body("name")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("name is required"),
  body("parent_id").optional().isInt().withMessage("must be number"),
];

module.exports = categoryValidation;
