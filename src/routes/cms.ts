const { cmsController } = require("../controller/cms");
const express = require("express");
const app = express();
import { Request, Response } from "express";
const validationResult = require("../utils/validations/validation-error");
// const categoryCreateValidation = require("../utils/validations/category/create");
// const categoryUpdateValidationEdit = require("../utils/validations/category/update");
const JWT = require("../utils/jsonwebtoken");
const { upload } = require("../utils/file-upload");

export const Routes = [
  {
    method: "get",
    route: "/list",
    controller: cmsController,
    action: "all",
    validationField: "",
    isLogin: true,
    fileUpload: false,
  },
  {
    method: "get",
    route: "/get/:id",
    controller: cmsController,
    action: "getOne",
    validationField: "",
    isLogin: true,
    fileUpload: false,
  },
  {
    method: "post",
    route: "/save",
    controller: cmsController,
    action: "save",
    validationField: "",
    isLogin: true,
    fileUpload: true
  },
  {
    method: "post",
    route: "/getBytag",
    controller: cmsController,
    action: "getByTag",
    validationField: "",
    isLogin: false,
    fileUpload: false
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
    route.fileUpload
      ? upload.any()
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
