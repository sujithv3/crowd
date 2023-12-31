const { CampaignController } = require("../controller/Campaign");
const express = require("express");
const app = express();
import { Request, Response } from "express";
const validationResult = require("../utils/validations/validation-error");
const JWT = require("../utils/jsonwebtoken");

export const Routes = [
  {
    method: "get",
    route: "/get",
    controller: CampaignController,
    action: "get",
    validationField: "",
    isLogin: false,
  },
  {
    method: "get",
    route: "/get/:id",
    controller: CampaignController,
    action: "getOne",
    validationField: "",
    isLogin: false,
  },
  {
    method: "get",
    route: "/download/:id",
    controller: CampaignController,
    action: "download",
    validationField: "",
    isLogin: false,
  },
  {
    method: "get",
    route: "/recent",
    controller: CampaignController,
    action: "recent",
    validationField: "",
    isLogin: false,
  },
  {
    method: "get",
    route: "/user/get",
    controller: CampaignController,
    action: "getUserBased",
    validationField: "",
    isLogin: true,
  },
  {
    method: "get",
    route: "/country",
    controller: CampaignController,
    action: "getCountry",
    validationField: "",
    isLogin: false,
  },
  {
    method: "get",
    route: "/deal-size",
    controller: CampaignController,
    action: "getDealSize",
    validationField: "",
    isLogin: false,
  },
  {
    method: "get",
    route: "/stage",
    controller: CampaignController,
    action: "getStages",
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
