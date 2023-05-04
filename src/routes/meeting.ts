/**
 * Created By Muthu
 * routers will be blocked after moved the seed
 */
const { MeetingController } = require("../controller/meeting");
const express = require("express");
const app = express();
import { Request, Response } from "express";
const validationResult = require("../utils/validations/validation-error");
const JWT = require("../utils/jsonwebtoken");

export const Routes = [
  {
    method: "post",
    route: "/add",
    controller: MeetingController,
    action: "add",
    validationField: "",
    isLogin: true,
  },
  {
    method: "post",
    route: "/remove",
    controller: MeetingController,
    action: "remove",
    validationField: "",
    isLogin: true,
  },
  {
    method: "get",
    route: "/list",
    controller: MeetingController,
    action: "list",
    validationField: "",
    isLogin: true,
  },
  {
    method: "get",
    route: "/list-investor-meeting",
    controller: MeetingController,
    action: "investorMeeting",
    validationField: "",
    isLogin: true,
  },
  {
    method: "get",
    route: "/get/:id",
    controller: MeetingController,
    action: "getone",
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
