const { UserController } = require("../controller/User");
const express = require("express");
const app = express();
import { Request, Response } from "express";
const validationResult = require("../utils/validations/validation-error");
const UserValidation = require("../utils/validations/user/user-validation");
const signupValidationEdit = require("../utils/validations/user/user-validation-edit");
const loginValidationEdit = require("../utils/validations/user/login");
const {
  changePasswordValidation,
  createPasswordValidation,
  forgetPasswordValidation,
} = require("../utils/validations/user/change-password");
const JWT = require("../utils/jsonwebtoken");
export const Routes = [
  {
    method: "get",
    route: "/list",
    controller: UserController,
    action: "all",
    validationField: "",
    isLogin: true,
  },
  {
    method: "get",
    route: "/list/:id",
    controller: UserController,
    action: "one",
    validationField: "",
    isLogin: true,
  },
  {
    method: "post",
    route: "/create",
    controller: UserController,
    action: "create",
    validationField: UserValidation,
    isLogin: false,
  },
  {
    method: "put",
    route: "/update",
    controller: UserController,
    action: "update",
    validationField: signupValidationEdit,
    isLogin: true,
  },
  {
    method: "delete",
    route: "/delete/:id",
    controller: UserController,
    action: "remove",
    validationField: "",
    isLogin: true,
  },
  {
    method: "post",
    route: "/login",
    controller: UserController,
    action: "login",
    validationField: loginValidationEdit,
    isLogin: false,
  },
  {
    method: "post",
    route: "/logout",
    controller: UserController,
    action: "logOut",
    validationField: "",
    isLogin: false,
  },
  {
    method: "post",
    route: "/change-password",
    controller: UserController,
    action: "changePassword",
    validationField: changePasswordValidation,
    isLogin: true,
  },
  {
    method: "post",
    route: "/forget-password",
    controller: UserController,
    action: "ForgetPassword",
    validationField: forgetPasswordValidation,
    isLogin: false,
  },
  {
    method: "post",
    route: "/create-password/:id/:token",
    controller: UserController,
    action: "createPassword",
    validationField: createPasswordValidation,
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
