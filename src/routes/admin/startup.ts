const { ListStartUp } = require("../../controller/admin/list-start-up");
const express = require("express");
const app = express();
import { Request, Response } from "express";
const validationResult = require("../../utils/validations/validation-error");
const JWT = require("../../utils/jsonwebtoken");
export const Routes = [
  {
    method: "get",
    route: "/start-up/list",
    controller: ListStartUp,
    action: "getStartUpList",
    validationField: "",
    isLogin: true,
  },
  {
    method: "get",
    route: "/start-up/list/:id",
    controller: ListStartUp,
    action: "getStartUpUser",
    validationField: "",
    isLogin: true,
  },
  {
    method: "get",
    route: "/start-up/campaign-list/:id",
    controller: ListStartUp,
    action: "getStartUpCampaign",
    validationField: "",
    isLogin: true,
  },
  {
    method: "get",
    route: "/start-up/assign/list",
    controller: ListStartUp,
    action: "assignedStartUp",
    validationField: "",
    isLogin: true,
  },
  {
    method: "get",
    route: "/start-up/un-assign/list",
    controller: ListStartUp,
    action: "unAssignedStartUp",
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
