const { UserController } = require("../controller/UserController");
const express = require("express");
const app = express();
import { Request, Response } from "express";
const validationResult = require("../utils/validations/validation-error");
const UserValidation = require("../utils/validations/user/user-validation");
const signupValidationEdit = require("../utils/validations/user/user-validation-edit");

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
    method: "put",
    route: "/update",
    controller: UserController,
    action: "update",
    validationField: signupValidationEdit,
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
  {
    method: "post",
    route: "/change-password",
    controller: UserController,
    action: "changePassword",
    validationField: "",
  },
  {
    method: "post",
    route: "/forget-password",
    controller: UserController,
    action: "ForgetPassword",
    validationField: "",
  },
  {
    method: "post",
    route: "/create-password/:id/:token",
    controller: UserController,
    action: "createPassword",
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
