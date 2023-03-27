const {
  paymentVerificationController,
} = require("../../../controller/start-up/campaigns/payment-verification");
const express = require("express");
const app = express();
import { Request, Response } from "express";
const validationResult = require("../../../utils/validations/validation-error");
const paymentVerificationCampaignValidation = require("../../../utils/validations/campaigns/payment-verification");
const JWT = require("../../../utils/jsonwebtoken");

export const Routes = [
  {
    method: "post",
    route: "/create",
    controller: paymentVerificationController,
    action: "create",
    validationField: paymentVerificationCampaignValidation,
    isLogin: true,
  },
  {
    method: "get",
    route: "/list",
    controller: paymentVerificationController,
    action: "list",
    validationField: "",
    isLogin: true,
  },
];

// function routes
Routes.forEach((route) => {
  (app as any)[route.method](
    route.route,
    route.isLogin
      ? JWT.verify
      : (req: Request, res: Response, next: Function) => {
          return next();
        },

    route.validationField
      ? validationResult(route.validationField)
      : (req: Request, res: Response, next: Function) => {
          return next();
        },
    (req: Request, res: Response, next: Function) => {
      const result = new (route.controller as any)()[route.action](
        req,
        res,
        next
      );
      if (result instanceof Promise) {
        result.then((result) =>
          result !== null && result !== undefined ? res.send(result) : undefined
        );
      } else if (result !== null && result !== undefined) {
        res.json(result);
      }
    }
  );
});

module.exports = app;
