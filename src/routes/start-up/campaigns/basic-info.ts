const {
  basicInfoController,
} = require("../../../controller/start-up/campaigns/basic-info");
const express = require("express");
const app = express();
import { Request, Response } from "express";
const validationResult = require("../../../utils/validations/validation-error");
const startUpValidation = require("../../../utils/validations/campaigns/start-campaign");
const JWT = require("../../../utils/jsonwebtoken");
const { upload } = require("../../../utils/file-upload");

export const Routes = [
  {
    method: "post",
    route: "/create",
    controller: basicInfoController,
    action: "create",
    validationField: "",
    isLogin: true,
    fileUpload: true,
  },
  {
    method: "get",
    route: "/list",
    controller: basicInfoController,
    action: "list",
    validationField: "",
    isLogin: true,
    fileUpload: false,
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
    route.fileUpload
      ? upload.fields([
          { name: "project_image", maxCount: 1 },
          { name: "project_video", maxCount: 1 },
        ])
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
