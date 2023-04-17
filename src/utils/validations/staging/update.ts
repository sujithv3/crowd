import { body } from "express-validator";

// validations for user
const stagingValidation = [
  body("name")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("name is required"),
  body("id")
    .isInt()
    .withMessage("must be number")
    .notEmpty()
    .withMessage("id is required"),
  body("parent_id").optional().isInt().withMessage("must be number"),
];

module.exports = stagingValidation;
