const { RolesController } = require("../controller/RolesControler");
const express = require("express");
const app = express();
import { Request, Response } from "express";
const validationResult = require("../utils/validations/validation-error");
const roleValidation = require("../utils/validations/roles/role-validation");

export const Routes = [
  {
    method: "get",
    route: "/list",
    controller: RolesController,
    action: "all",
    validationField: "",
  },
  {
    method: "get",
    route: "/list/:id",
    controller: RolesController,
    action: "one",
    validationField: "",
  },
  {
    method: "post",
    route: "/create",
    controller: RolesController,
    action: "create",
    validationField: roleValidation,
  },
  {
    method: "put",
    route: "/update",
    controller: RolesController,
    action: "update",
    validationField: roleValidation,
  },
  {
    method: "delete",
    route: "/delete/:id",
    controller: RolesController,
    action: "remove",
    validationField: "",
  },
  {
    method: "post",
    route: "/login",
    controller: RolesController,
    action: "login",
    validationField: "",
  },
];

// function routes
Routes.forEach((route) => {
  (app as any)[route.method](
    route.route,
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
