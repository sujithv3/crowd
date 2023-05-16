// created by : vijay
// purpose : category table create update delete and list

import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import axios from "axios";
import { botChat } from "../entity/botChat";
const responseMessage = require("../configs/response");
const Jwt = require("../utils/jsonwebtoken");
const msg = require("../configs/message");

export class BotchatController {
    private BotChatRepo = AppDataSource.getRepository(botChat)

    // list one
    async getChatbotList(
        request: Request,
        response: Response,
        next: NextFunction
    ) {
        try {

            const botChatList = await this.BotChatRepo
                .createQueryBuilder("botchat")
                .select()
                .getManyAndCount();

            return responseMessage.responseWithData(
                true,
                200,
                msg.campaignListSuccess,
                {
                    total_count: botChatList[1],
                    data: botChatList[0],
                }
            );
        } catch (err) {
            console.log(err);

            return responseMessage.responseWithData(
                false,
                400,
                msg.userListFailed,
                err
            );
        }
    }

    async getChatbotCategoryList(
        request: Request,
        response: Response,
        next: NextFunction
    ) {
        try {

            const botChatList = await this.BotChatRepo
                .createQueryBuilder("botchat")
                .where("botchat.qus_category = :cat",{
                    cat: request.body.category,
                })
                .select()
                .getManyAndCount();

            return responseMessage.responseWithData(
                true,
                200,
                msg.campaignListSuccess,
                {
                    total_count: botChatList[1],
                    data: botChatList[0],
                }
            );
        } catch (err) {
            console.log(err);

            return responseMessage.responseWithData(
                false,
                400,
                msg.userListFailed,
                err
            );
        }
    }
}
