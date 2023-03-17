const { stagingController } = require("../controller/staging");
const express = require("express");
const app = express();
import { Request, Response } from "express";
const validationResult = require("../utils/validations/validation-error");
const stagingCreateValidation = require("../utils/validations/staging/create");
const stagingUpdateValidation = require("../utils/validations/staging/update");
const JWT = require("../utils/jsonwebtoken");
export const Routes = [
  {
    method: "post",
    route: "/create",
    controller: stagingController,
    action: "create",
    validationField: stagingCreateValidation,
    isLogin: true,
  },
  {
    method: "get",
    route: "/list",
    controller: stagingController,
    action: "all",
    validationField: "",
    isLogin: false,
  },
  {
    method: "get",
    route: "/list/:id",
    controller: stagingController,
    action: "one",
    validationField: "",
    isLogin: true,
  },
  {
    method: "put",
    route: "/update",
    controller: stagingController,
    action: "update",
    validationField: stagingUpdateValidation,
    isLogin: true,
  },
  {
    method: "delete",
    route: "/delete/:id",
    controller: stagingController,
    action: "remove",
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
