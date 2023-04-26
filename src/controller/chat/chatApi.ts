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
import { ChatGroup, GROUP_TYPE } from "../../entity/chatGroup";
import { ChatMessage } from "../../entity/chatMessages";
import { ChatGroupMember, MEMBER_TYPE } from "../../entity/chatGroupMembers";

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

    async postTextMessage(request: Request, res: Response, next: NextFunction) {
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

            if (request.body.startup_id) { // for RM To startup
                // const group_member = this.ChatGroupMemberRepository.createQueryBuilder('members')
                //     .innerJoin('members.group', 'group', 'members.user_id=:user_id', req.body.startup_id) // find startup with members
                //     .innerJoin('members.group', 'group', 'members.user_id=:user_id', req.body.startup_id) // find investor with members
                //     .where('group.type=:type AND members.user_id=:user_id', { type: GROUP_TYPE }).execute();

                let group = await this.ChatGroupRepository.createQueryBuilder('group')
                    .innerJoin('group.members', 'startup', 'startup.user_id=:startup_id', { startup_id: request.body.startup_id }) // find startup with members
                    .innerJoin('group.members', 'user', 'user.execuive_id=:user_id', { user_id: user[0].id }) // find investor with members
                    .where('group.type=:type', { type: GROUP_TYPE.STARTUP }).getOne();
                console.log('group_member', group);

                if (!group) { // create group
                    // create group
                    group = await this.ChatGroupRepository.save({
                        type: GROUP_TYPE.STARTUP,
                        count: 2,
                        title: 'individual user'
                    });

                    // create 2 members for this group
                    console.log('result', group);
                    const member1 = await this.ChatGroupMemberRepository.save({
                        user_type: MEMBER_TYPE.STARTUP,
                        user: { id: request.body.startup_id },
                        group: { id: group.id }
                    });

                    const member2 = await this.ChatGroupMemberRepository.save({
                        user_type: MEMBER_TYPE.RM,
                        executive: { id: user[0].id },
                        group: { id: group.id }
                    });
                }
                if (group.id > 0) { // post message
                    // find group Member id
                    if (group.type === 'STARTUP') {

                        let current_member = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                            .where('member.execuive_id=:user_id AND member.group_id=:id', { user_id: user[0].id, id: group.id }) // find logged in user with members
                            .getOne();
                        console.log('current_member', current_member);

                        const message = await this.ChatMessageRepository.save({
                            message: request.body.message,
                            from: { id: current_member.id }
                        })
                    }
                }
            }
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

    async getMessages(request: Request, res: Response, next: NextFunction) {
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

            const group_id = request.body.group_id;
            // get all messages belongs to this group
            const message = await this.ChatMessageRepository.createQueryBuilder('message')
                .innerJoin('message.group', 'group', 'group.id=:group_id', { group_id })
                .leftJoin('message.user', 'user')
                .leftJoin('message.executive', 'executive').getMany();

            return responseMessage.responseWithData(
                true,
                200,
                msg.chat_post_success,
                message
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
