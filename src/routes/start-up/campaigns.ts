const {
  CampaignController,
} = require("../../controller/start-up/campaigns/campaings");
const express = require("express");
const app = express();
import { Request, Response } from "express";
const validationResult = require("../../utils/validations/validation-error");
const UserValidation = require("../../utils/validations/user/user-validation");
const signupValidationEdit = require("../../utils/validations/user/user-validation-edit");
const JWT = require("../../utils/jsonwebtoken");
export const Routes = [
  {
    method: "get",
    route: "/list",
    controller: CampaignController,
    action: "all",
    validationField: "",
    isLogin: true,
  },
  {
    method: "get",
    route: "/list/:id",
    controller: CampaignController,
    action: "getOne",
    validationField: "",
    isLogin: false,
  },
  {
    method: "delete",
    route: "/delete/:id",
    controller: CampaignController,
    action: "delete",
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
