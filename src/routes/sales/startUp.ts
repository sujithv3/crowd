const {TaggedSalesController} = require("../../controller/sales/startUp")
const express = require("express");
const app = express();
import { Request, Response } from "express";
const validationResult = require("../../utils/validations/validation-error");
const JWT = require("../../utils/jsonwebtoken");
const { upload } = require("../../utils/file-upload");

export const Routes = [
  {
    method: "get",
    route: "/list",
    controller: TaggedSalesController,
    action: "all",
    validationField: "",
    isLogin: true,
    fileUpload: false,
  },
  {
    method: "get",
    route: "/get/:id",
    controller: TaggedSalesController,
    action: "one",
    validationField: "",
    isLogin: true,
    fileUpload: false,
  },
  {
    method: "get",
    route: "/legalStatus/list",
    controller: TaggedSalesController,
    action: "legalStatus",
    validationField: "",
    isLogin: true,
    fileUpload: false,
  }
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