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
import { ChatOnline, USER_TYPE } from "../../entity/chatOnline";
import { Users } from "../../entity/Users";
import { rmAdmin } from "../../entity/rmAdmin";



export class ChatHooksController {
    private ChatOnlineRepository = AppDataSource.getTreeRepository(ChatOnline);
    private UserRepository = AppDataSource.getTreeRepository(Users);
    private RmAdminRepository = AppDataSource.getTreeRepository(rmAdmin);

    // campaign detail view
    async connect(req: Request, res: Response, next: NextFunction) {
        try {

            let user_id = null;
            let manage_id = null;
            const clientid = req.body.clientid;
            let userType: USER_TYPE = USER_TYPE.STARTUP;
            const userCode = clientid.substring(0, 3);
            if (userCode === 'STR') {
                user_id = parseInt(req.body.username);
                userType = USER_TYPE.STARTUP;
            } else if (userCode === 'INV') {
                user_id = parseInt(req.body.username);
                userType = USER_TYPE.INVESTOR;
            } else if (userCode === 'RMN') {
                manage_id = parseInt(req.body.username);
                userType = USER_TYPE.RM;
            } else if (userCode === 'SLS') {
                manage_id = parseInt(req.body.username);
                userType = USER_TYPE.SALES_EXECUTIVE;
            } if (userCode === 'ADM') {
                manage_id = parseInt(req.body.username);
                userType = USER_TYPE.ADMIN;
            }
            let user = null;
            if (user_id > 0) {
                user = await this.UserRepository.findOne({
                    where: { id: user_id },
                });
            }
            let executive = null;
            if (manage_id > 0) {
                executive = await this.RmAdminRepository.findOne({
                    where: { id: manage_id },
                });
            }

            await this.ChatOnlineRepository.save({
                user,
                executive,
                clientId: clientid,
                created_date: new Date(),
                updated_date: new Date(),
            })
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
            const clientid = req.body.clientid;
            await this.ChatOnlineRepository
                .createQueryBuilder('chat')
                .update()
                .set({
                    user: null,
                    executive: null,
                }).where("clientId = :clientid", { clientid }).execute();
            await this.ChatOnlineRepository
                .createQueryBuilder('chat')
                .delete().where("clientId = :clientid", { clientid }).execute();

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
