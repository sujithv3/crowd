import { body } from "express-validator";

// validations for user
const TeamsCampaignValidation = [
  body().isArray(),
  body("*.first_name")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("first_name is required"),
  body("*.last_name")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("last_name is required"),
  body("*.contact_number")
    .isString()
    .withMessage("contact_number be string")
    .notEmpty()
    .withMessage("contact_number is required"),
  body("*.summary")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("summary is required"),
  body("*.linkedin")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("linkedin is required"),
  body("*.role").notEmpty().withMessage("role is required"),
  body("*.is_active").isBoolean().withMessage("role be boolean").optional(),
  body("*.email_id").isEmail().notEmpty().withMessage("email is required"),
];

module.exports = TeamsCampaignValidation;
