const { locationController } = require("../controller/locations");
const express = require("express");
const app = express();
import { Request, Response } from "express";
const validationResult = require("../utils/validations/validation-error");
const locationValidation = require("../utils/validations/location/locations");
const JWT = require("../utils/jsonwebtoken");
export const Routes = [
  {
    method: "post",
    route: "/create",
    controller: locationController,
    action: "create",
    validationField: locationValidation,
    isLogin: true,
  },
  {
    method: "get",
    route: "/list",
    controller: locationController,
    action: "all",
    validationField: "",
    isLogin: true,
  },
  {
    method: "get",
    route: "/list/:id",
    controller: locationController,
    action: "one",
    validationField: "",
    isLogin: true,
  },
  {
    method: "put",
    route: "/update",
    controller: locationController,
    action: "update",
    validationField: locationValidation,
    isLogin: true,
  },
  {
    method: "delete",
    route: "/delete/:id",
    controller: locationController,
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
