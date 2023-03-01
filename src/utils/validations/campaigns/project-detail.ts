import { body } from "express-validator";

// validations for user
const projectDetailCampaignValidation = [
  body("description")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("description is required"),
  body("challenges")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("challenges is required"),
  body("faq").isString().withMessage("must be string").optional(),
];

module.exports = projectDetailCampaignValidation;
