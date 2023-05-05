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
    isLogin: true,
  },
  {
    method: "post",
    route: "/postStartupMessage",
    controller: ChatApiController,
    action: "postStartupMessage",
    validationField: "",
    isLogin: true,
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
    isLogin: true,
  },
  {
    method: "get",
    route: "/getInvestorUsers",
    controller: ChatApiController,
    action: "getInvestorUsers",
    validationField: "",
    isLogin: true,
  },
  {
    method: "get",
    route: "/getStartupUsers",
    controller: ChatApiController,
    action: "getStartupUsers",
    validationField: "",
    isLogin: true,
  },
  {
    method: "get",
    route: "/getNotification",
    controller: ChatApiController,
    action: "getNotification",
    validationField: "",
    isLogin: true,
  },
  {
    method: "get",
    route: "/getInvestorList/:id",
    controller: ChatApiController,
    action: "getInvestorList",
    validationField: "",
    isLogin: true,
  },
  {
    method: "post",
    route: "/createGroup",
    controller: ChatApiController,
    action: "createGroup",
    validationField: "",
    isLogin: true,
  },
  {
    method: "post",
    route: "/rename",
    controller: ChatApiController,
    action: "rename",
    validationField: "",
    isLogin: true,
  },
  {
    method: "post",
    route: "/deactivate",
    controller: ChatApiController,
    action: "deactivate",
    validationField: "",
    isLogin: true,
  },
  {
    method: "post",
    route: "/delete",
    controller: ChatApiController,
    action: "delete",
    validationField: "",
    isLogin: true,
  },
  {
    method: "post",
    route: "/activate",
    controller: ChatApiController,
    action: "activate",
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
