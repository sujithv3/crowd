const { BotchatController } = require("../controller/bot-chat");
const express = require("express");
const app = express();
import { Request, Response } from "express";
const validationResult = require("../utils/validations/validation-error");
// const categoryCreateValidation = require("../utils/validations/category/create");
// const categoryUpdateValidationEdit = require("../utils/validations/category/update");
const JWT = require("../utils/jsonwebtoken");
export const Routes = [
    {
        method: "get",
        route: "/getAll",
        controller: BotchatController,
        action: "getChatbotList",
        validationField: "",
        isLogin: true,
    },
    {
        method: "get",
        route: "/getCategory",
        controller: BotchatController,
        action: "getChatbotCategoryList",
        validationField: "",
        isLogin: true,
    }

];

// function routes
Routes.forEach((route) => {
    (app as any)[route.method](
        route.route,
        // route.isLogin
        //     ? JWT.verify
        //     : (req: Request, res: Response, next: Function) => {
        //         return next();
        //     },
        // route.validationField
        //     ? validationResult(route.validationField)
        //     : (req: Request, res: Response, next: Function) => {
        //         return next();
        //     },
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
