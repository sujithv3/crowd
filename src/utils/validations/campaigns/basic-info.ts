import { body, check } from "express-validator";

// validations for user
const basicInfoCampaignValidation = [
  body("title")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("title is required"),

  body("demo_url").isString().withMessage("must be string").optional(),

  body("tag").isString().withMessage("must be string").optional(),

  body("tag_line")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("tag_line is required"),
  body("location").isString().withMessage("must be string").optional(),
];

module.exports = basicInfoCampaignValidation;
