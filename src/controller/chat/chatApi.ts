// created by : Muthukumar
// purpose : Campaign list view for carousel view for dashboard & investor

import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { Campaigns, CAMPAIGN_STATUS } from "../../entity/campaigns";
const responseMessage = require("../../configs/response");
const msg = require("../../configs/message");
const Jwt = require("./../../utils/jsonwebtoken");
import { Staging } from "../../entity/staging";

import { ChatOnline, USER_TYPE } from "../../entity/chatOnline";
import { Users } from "../../entity/Users";
import { rmAdmin } from "../../entity/rmAdmin";
import { ChatGroup } from "../../entity/chatGroup";
import { ChatMessage } from "../../entity/chatMessages";
import { ChatGroupMember } from "../../entity/chatGroupMembers";

const mqtt = require('mqtt');

export class ChatApiController {
    private userRepository = AppDataSource.getRepository(Users);
    private ChatOnlineRepository = AppDataSource.getRepository(ChatOnline);
    private ChatMessageRepository = AppDataSource.getRepository(ChatMessage);
    private ChatGroupMemberRepository = AppDataSource.getRepository(ChatGroupMember);
    private ChatGroupRepository = AppDataSource.getRepository(ChatGroup);

    async initConnection() {
        const qos = 0;
        const host = '127.0.0.1';
        const clientId = 'AdecMqttserver';
        const port = 8083;
        const url = `ws://${host}:${port}/mqtt`;
        const mqttOptions = {
            clientId: clientId,
            keepalive: 0,
            protocolId: 'MQTT',
            protocolVersion: 4,
            clean: true,
            reconnectPeriod: 1000,
            connectTimeout: 30 * 1000,
            will: {
                topic: 'WillMsg',
                payload: 'Connection Closed abnormally..!',
                qos: qos,
                retain: false
            },
            rejectUnauthorized: false
        };
        return mqtt.connect(url, mqttOptions)
    }

    async getRMusers(request: Request, res: Response, next: NextFunction) {
        try {
            // const client = this.initConnection();
            // client.publish(topic, payload, { qos }, (error: any) => {
            //     if (error) {
            //         console.log('Publish error: ', error);
            //     }
            // });
            let token: any;
            if (
                typeof request.cookies.token === "undefined" ||
                request.cookies.token === null
            ) {
                token = request.headers.authorization.slice(7);
            } else {
                token = request.cookies.token;
            }

            const user = Jwt.decode(token);

            // get all tagged startup users

            let TaggedUser = await this.userRepository
                .createQueryBuilder("startup")
                .select([
                    'startup.id',
                    'startup.company_name',
                    'startup.company_logo',
                    'startup.profile'
                ])
                .innerJoin("startup.tagged", "tagged")
                .leftJoinAndSelect("startup.online", "online")
                .where("tagged.rm_id = :id AND tagged.is_active=true", {
                    id: user[0].id,
                }).getRawMany();


            return responseMessage.responseWithData(
                true,
                200,
                msg.chat_post_success,
                TaggedUser
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

    async getInvestorUsers(req: Request, res: Response, next: NextFunction) {
        try {
            // const client = this.initConnection();
            // client.publish(topic, payload, { qos }, (error: any) => {
            //     if (error) {
            //         console.log('Publish error: ', error);
            //     }
            // });
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

    async getStartupUsers(req: Request, res: Response, next: NextFunction) {
        try {
            // const client = this.initConnection();
            // client.publish(topic, payload, { qos }, (error: any) => {
            //     if (error) {
            //         console.log('Publish error: ', error);
            //     }
            // });
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

    async postTextMessage(req: Request, res: Response, next: NextFunction) {
        try {
            // const client = this.initConnection();
            // client.publish(topic, payload, { qos }, (error: any) => {
            //     if (error) {
            //         console.log('Publish error: ', error);
            //     }
            // });
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
