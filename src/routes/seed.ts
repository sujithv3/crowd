/**
 * Created By Muthu
 * routers will be blocked after moved the seed
 */
const { SeedController } = require("../controller/seed");
const express = require("express");
const app = express();
import { Request, Response } from "express";
const validationResult = require("../utils/validations/validation-error");
const JWT = require("../utils/jsonwebtoken");

export const Routes = [
  {
    method: "post",
    route: "/seed-category",
    controller: SeedController,
    action: "seedCategory",
    validationField: "",
    isLogin: false,
  },
  {
    method: "post",
    route: "/seed-stages",
    controller: SeedController,
    action: "seedStages",
    validationField: "",
    isLogin: false,
  },
  {
    method: "post",
    route: "/categories",
    controller: SeedController,
    action: "categories",
    validationField: "",
    isLogin: false,
  },
  {
    method: "post",
    route: "/triggers",
    controller: SeedController,
    action: "triggers",
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
