// created by : vijay
// purpose route for funds api

const {
  fundsController,
} = require("../../../controller/start-up/campaigns/funds");
const express = require("express");
const app = express();
import { Request, Response } from "express";
const validationResult = require("../../../utils/validations/validation-error");
const fundsCampaignValidation = require("../../../utils/validations/campaigns/funds");
const JWT = require("../../../utils/jsonwebtoken");
const { upload } = require("../../../utils/file-upload");

export const Routes = [
  {
    method: "post",
    route: "/create",
    controller: fundsController,
    action: "create",
    validationField: fundsCampaignValidation,
    isLogin: true,
    fileUpload: true,
  },
  {
    method: "get",
    route: "/list",
    controller: fundsController,
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
