import { body } from "express-validator";

// validations for user
const roleValidation = [
  body("title")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("title is required"),
  body("tag_line")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("tag line is required"),
  body("location")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("location is required"),
  body("currency")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("currency is required"),
  body("tax")
    .isNumeric()
    .withMessage("tax be number")
    .notEmpty()
    .withMessage("currency is required"),
  body("project_image").notEmpty().withMessage("project image is required"),
  body("project_video").notEmpty().withMessage("project video is required"),
  body("demo_url")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("demo url is required"),
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
  body("goal_amount")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("goal amount is required"),
  body("min_invest")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("min invest is required"),
  body("max_invest")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("max invest is required"),
];

module.exports = roleValidation;
