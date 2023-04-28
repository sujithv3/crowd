const { ChatApiController } = require("../../controller/chat/chatApi");
const express = require("express");
const app = express();
import { Request, Response } from "express";
const validationResult = require("../../utils/validations/validation-error");
// const roleValidation = require("../../utils/validations/roles/role-validation");
const JWT = require("../../utils/jsonwebtoken");

export const Routes = [
  {
    method: "post",
    route: "/postTextMessage",
    controller: ChatApiController,
    action: "postTextMessage",
    validationField: "",
    isLogin: false,
  },
  {
    method: "get",
    route: "/getMessages/:id",
    controller: ChatApiController,
    action: "getMessages",
    validationField: "",
    isLogin: true,
  },
  {
    method: "get",
    route: "/getRMusers",
    controller: ChatApiController,
    action: "getRMusers",
    validationField: "",
    isLogin: false,
  },
  {
    method: "get",
    route: "/getInvestorUsers",
    controller: ChatApiController,
    action: "getInvestorUsers",
    validationField: "",
    isLogin: false,
  },
  {
    method: "get",
    route: "/getStartupUsers",
    controller: ChatApiController,
    action: "getStartupUsers",
    validationField: "",
    isLogin: false,
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
