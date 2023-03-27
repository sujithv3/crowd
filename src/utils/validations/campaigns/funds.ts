import { body } from "express-validator";

// validations for user
const fundsCampaignValidation = [
  body("goal_amount")
    .isInt()
    .withMessage("must be number")
    .notEmpty()
    .withMessage("goal_amount is required"),
  body("min_invest")
    .isInt()
    .withMessage("must be number")
    .notEmpty()
    .withMessage("min_invest is required"),
  body("max_invest")
    .isInt()
    .withMessage("must be number")
    .notEmpty()
    .withMessage("max_invest is required"),
  body("currency")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("currency is required"),
  body("deal_size")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("deal_size is required"),

  body("duration")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("duration is required"),
];

module.exports = fundsCampaignValidation;
