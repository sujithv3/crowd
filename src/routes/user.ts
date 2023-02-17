const { UserController } = require("../controller/UserController");
const express = require("express");
const app = express();
import { Request, Response } from "express";
const validationResult = require("../utils/validations/validation-error");
const UserValidation = require("../utils/validations/user/user-validation");

export const Routes = [
  {
    method: "get",
    route: "/list",
    controller: UserController,
    action: "all",
    validationField: "",
  },
  {
    method: "get",
    route: "/list/:id",
    controller: UserController,
    action: "one",
    validationField: "",
  },
  {
    method: "post",
    route: "/create",
    controller: UserController,
    action: "create",
    validationField: UserValidation,
  },
  {
    method: "delete",
    route: "/delete/:id",
    controller: UserController,
    action: "remove",
    validationField: "",
  },
  {
    method: "post",
    route: "/login",
    controller: UserController,
    action: "login",
    validationField: "",
  },
];

// function routes
Routes.forEach((route) => {
  (app as any)[route.method](
    route.route,
    route.validationField
      ? validationResult(UserValidation)
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
