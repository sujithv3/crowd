const { rmSalesList } = require("../../controller/relation-mang/salesAssign");
const express = require("express");
const app = express();
import { Request, Response } from "express";
const validationResult = require("../../utils/validations/validation-error");
const JWT = require("../../utils/jsonwebtoken");
export const Routes = [
    {
        method: "get",
        route: "/list",
        controller: rmSalesList,
        action: "getSalesList",
        validationField: "",
        isLogin: true,
    },
    {
        method: "get",
        route: "/assign/list",
        controller: rmSalesList,
        action: "assignedStartup",
        validationField: "",
        isLogin: true,
    },
    {
        method: "get",
        route: "/un-assign/list",
        controller: rmSalesList,
        action: "unAssignedStartup",
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
