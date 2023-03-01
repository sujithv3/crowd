import { body, check } from "express-validator";

// validations for user
const basicInfoCampaignValidation = [
  body("title")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("title is required"),

  body("primary_category")
    .isInt()
    .withMessage("must be number")
    .notEmpty()
    .withMessage("primary_category is required"),
  body("primary_sub_category")
    .isInt()
    .withMessage("must be number")
    .notEmpty()
    .withMessage("primary_sub_category is required"),
  body("demo_url")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("demo_url is required"),
  body("tag")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("tag is required"),
  body("tag_line")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("tag_line is required"),
  body("location")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("location is required"),
];

module.exports = basicInfoCampaignValidation;
