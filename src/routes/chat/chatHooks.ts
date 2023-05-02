const { ChatHooksController } = require("../../controller/chat/chatHooks");
const express = require("express");
const app = express();
import { Request, Response } from "express";
const validationResult = require("../../utils/validations/validation-error");
const roleValidation = require("../../utils/validations/roles/role-validation");
const JWT = require("../../utils/jsonwebtoken");

export const Routes = [
  {
    method: "post",
    route: "/connect",
    controller: ChatHooksController,
    action: "connect",
    validationField: "",
    isLogin: false,
  },
  {
    method: "post",
    route: "/disconnect",
    controller: ChatHooksController,
    action: "disconnect",
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
