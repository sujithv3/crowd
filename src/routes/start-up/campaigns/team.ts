const {
  teamController,
} = require("../../../controller/start-up/campaigns/team");
const express = require("express");
const app = express();
import { Request, Response } from "express";
const validationResult = require("../../../utils/validations/validation-error");
const TeamsCampaignValidation = require("../../../utils/validations/campaigns/teams");
const JWT = require("../../../utils/jsonwebtoken");

export const Routes = [
  {
    method: "post",
    route: "/create",
    controller: teamController,
    action: "create",
    validationField: TeamsCampaignValidation,
    isLogin: true,
  },
  {
    method: "get",
    route: "/list",
    controller: teamController,
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
