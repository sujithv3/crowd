// created by : Muthukumar
// purpose : Campaign list view for carousel view for dashboard & investor

import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { Campaigns, CAMPAIGN_STATUS } from "../../entity/campaigns";
const responseMessage = require("../../configs/response");
const msg = require("../../configs/message");
const Jwt = require("./../../utils/jsonwebtoken");
var async = require("async");
var request = require("request");
var archiver = require("archiver");
import { ChatOnline } from "../../entity/chatOnline";



export class ChatHooksController {
    private ChatOnlineRepository = AppDataSource.getTreeRepository(ChatOnline);

    // campaign detail view
    async connect(req: Request, res: Response, next: NextFunction) {
        try {
            return responseMessage.responseWithData(
                true,
                200,
                msg.chat_post_success
            );
        } catch (error) {
            console.log(error);
            return responseMessage.responseWithData(
                false,
                400,
                msg.chat_post_success,
                error
            );
        }
    }

    async disconnect(req: Request, res: Response, next: NextFunction) {
        try {
            return responseMessage.responseWithData(
                true,
                200,
                msg.chat_post_success
            );
        } catch (error) {
            console.log(error);
            return responseMessage.responseWithData(
                false,
                400,
                msg.chat_post_success,
                error
            );
        }
    }
}
