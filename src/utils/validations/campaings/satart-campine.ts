import { body } from "express-validator";

// validations for user
const startCampaignValidation = [
  body("category")
    .isInt()
    .withMessage("must be number")
    .notEmpty()
    .withMessage("category is required"),
  body("sub_category").isInt().withMessage("must be number").optional(),
  body("business_type")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("location is required")
    .isIn(["business", "individual"])
    .withMessage("Fruit does contain invalid value"),
  body("tax_location")
    .isInt()
    .withMessage("must be number")
    .notEmpty()
    .withMessage("tax_location is required"),
  body("bank_location")
    .isInt()
    .withMessage("must be number")
    .notEmpty()
    .withMessage("bank_location is required"),
  body("currency")
    .isString()
    .withMessage("must be string")
    .notEmpty()
    .withMessage("currency is required"),
];

module.exports = startCampaignValidation;
