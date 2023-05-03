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
            username: 'admin',
            password: 'Dairyarm@32',
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
            // get all groups
            const members = await this.ChatGroupRepository
                .createQueryBuilder("group")
                .innerJoinAndSelect('group.members', 'members')
                // .addSelect('SELECT message from chat_message WHERE ')
                .leftJoinAndSelect('group.messages', 'message', 'message.latest=1')
                .leftJoinAndSelect('members.user', 'startup')
                .innerJoinAndSelect("startup.tagged", "tagged")
                .leftJoinAndSelect("startup.online", "online")
                .where("tagged.rm_id = :id AND tagged.is_active=true", {
                    id: user[0].id,
                })
                .getRawMany();

            console.log('members', members);

            // get all tagged startup users
            // let TaggedUser = await this.userRepository
            //     .createQueryBuilder("startup")
            //     .select([
            //         'startup.id',
            //         'startup.company_name',
            //         'startup.company_logo',
            //         'startup.profile'
            //     ])
            //     .innerJoin("startup.tagged", "tagged")
            //     .leftJoinAndSelect("startup.online", "online")
            //     .where("tagged.rm_id = :id AND tagged.is_active=true", {
            //         id: user[0].id,
            //     }).getRawMany();


            return responseMessage.responseWithData(
                true,
                200,
                msg.chat_post_success,
                members
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

    async getStartupUsers(request: Request, res: Response, next: NextFunction) {
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
            // get all groups
            const members = await this.ChatGroupRepository
                .createQueryBuilder("group")
                .innerJoinAndSelect('group.members', 'members')
                .innerJoinAndSelect('group.members', 'user')
                .leftJoinAndSelect('group.messages', 'message', 'message.latest=1')
                .leftJoinAndSelect('members.executive', 'executive')
                .innerJoinAndSelect("executive.tagged", "tagged")
                .leftJoinAndSelect("executive.online", "online")
                .where("tagged.start_up_id = :id AND user.user_id = :id AND tagged.is_active=true", {
                    id: user[0].id,
                })
                .getRawMany();

            console.log('members', members);
            return responseMessage.responseWithData(
                true,
                200,
                msg.chat_post_success,
                members
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

            // const group_member = this.ChatGroupMemberRepository.createQueryBuilder('members')
            //     .innerJoin('members.group', 'group', 'members.user_id=:user_id', req.body.startup_id) // find startup with members
            //     .innerJoin('members.group', 'group', 'members.user_id=:user_id', req.body.startup_id) // find investor with members
            //     .where('group.type=:type AND members.user_id=:user_id', { type: GROUP_TYPE }).execute();
            const group_id = request.body.group_id;

            // find group Member id

            let current_member = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                .where('member.execuive_id=:user_id AND member.group_id=:id', { user_id: user[0].id, id: group_id }) // find logged in user with members
                .getOne();
            console.log('current_member', current_member);

            if (current_member) {

                // update other message to 0
                await this.ChatMessageRepository.createQueryBuilder('message').update().set({
                    latest: false
                }).where('group_id=:id', { id: group_id }).execute();

                const message = await this.ChatMessageRepository.save({
                    message: request.body.message,
                    from: { id: current_member.id },
                    group: { id: group_id }
                });
                const client: any = await this.initConnection();
                // if(current_member.user_type=='RM') {
                // get all members belongs to this group
                let members = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                    .leftJoinAndSelect('member.executive', 'executive')
                    .leftJoinAndSelect('member.user', 'user')
                    .where('member.group_id=:id', { id: group_id }) // find logged in user with members
                    .getRawMany();

                const one_message: any = await this.ChatMessageRepository.createQueryBuilder('message')
                    // .innerJoin('message.group', 'group', 'group.id=:group_id', { group_id })
                    // .select([
                    //     'message.createdDate',
                    //     'message.latest',
                    //     'message.message',
                    //     'message.message_type',
                    //     'message.from_id',
                    //     'user.name',
                    //     'message.from_id',
                    // ])
                    .where('message.id=:id', { id: message.id })
                    .innerJoinAndSelect('message.from', 'member')
                    .leftJoinAndSelect('member.executive', 'executive')
                    .leftJoinAndSelect('member.user', 'user')
                    .getOne();
                one_message.type = 'chat';

                for (let i = 0; i < members.length; i++) {
                    const activeMember = members[i];
                    console.log('activeMember', activeMember);
                    let topic = '';
                    let profile = '';
                    if (activeMember.member_user_type == 'RM') {
                        topic = 'AdminChat/' + activeMember.executive_id;
                        profile = activeMember?.executive_profile
                    } else {
                        topic = 'chat/' + activeMember.user_id;
                        profile = activeMember?.user_profile
                    }
                    // let payload = {
                    //     type: 'chat',
                    //     message: request.body.message,
                    //     userType: activeMember.member_user_type,
                    //     profile: profile
                    // };
                    console.log('client?.publish', client?.publish);
                    if (client?.publish) {
                        // console.log('AdminChat/1' === topic)
                        console.log('message publish', topic, one_message);

                        client.publish(topic, JSON.stringify(one_message), { qos: 0 }, (error: any) => {
                            if (error) {
                                console.log('Publish error: ', error);
                            }
                        });
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

    async postStartupMessage(request: Request, res: Response, next: NextFunction) {
        try {

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

            console.log('user', user);

            // const group_member = this.ChatGroupMemberRepository.createQueryBuilder('members')
            //     .innerJoin('members.group', 'group', 'members.user_id=:user_id', req.body.startup_id) // find startup with members
            //     .innerJoin('members.group', 'group', 'members.user_id=:user_id', req.body.startup_id) // find investor with members
            //     .where('group.type=:type AND members.user_id=:user_id', { type: GROUP_TYPE }).execute();
            const group_id = request.body.group_id;

            // find group Member id

            let current_member = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                .where('member.user_id=:user_id AND member.group_id=:id', { user_id: user[0].id, id: group_id }) // find logged in user with members
                .getOne();
            console.log('current_member', current_member);

            if (current_member) {

                // update other message to 0
                await this.ChatMessageRepository.createQueryBuilder('message').update().set({
                    latest: false
                }).where('group_id=:id', { id: group_id }).execute();

                const message = await this.ChatMessageRepository.save({
                    message: request.body.message,
                    from: { id: current_member.id },
                    group: { id: group_id }
                });
                const client: any = await this.initConnection();
                // if(current_member.user_type=='RM') {
                // get all members belongs to this group
                let members = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                    .leftJoinAndSelect('member.executive', 'executive')
                    .leftJoinAndSelect('member.user', 'user')
                    .where('member.group_id=:id', { id: group_id }) // find logged in user with members
                    .getRawMany();

                const one_message: any = await this.ChatMessageRepository.createQueryBuilder('message')
                    // .innerJoin('message.group', 'group', 'group.id=:group_id', { group_id })
                    // .select([
                    //     'message.createdDate',
                    //     'message.latest',
                    //     'message.message',
                    //     'message.message_type',
                    //     'message.from_id',
                    //     'user.name',
                    //     'message.from_id',
                    // ])
                    .where('message.id=:id', { id: message.id })
                    .innerJoinAndSelect('message.from', 'member')
                    .leftJoinAndSelect('member.executive', 'executive')
                    .leftJoinAndSelect('member.user', 'user')
                    .getOne();
                one_message.type = 'chat';

                for (let i = 0; i < members.length; i++) {
                    const activeMember = members[i];
                    console.log('activeMember', activeMember);
                    let topic = '';
                    let profile = '';
                    if (activeMember.member_user_type == 'RM') {
                        topic = 'AdminChat/' + activeMember.executive_id;
                        profile = activeMember?.executive_profile
                    } else {
                        topic = 'chat/' + activeMember.user_id;
                        profile = activeMember?.user_profile
                    }
                    // let payload = {
                    //     type: 'chat',
                    //     message: request.body.message,
                    //     userType: activeMember.member_user_type,
                    //     profile: profile
                    // };
                    console.log('client?.publish', client?.publish);
                    if (client?.publish) {
                        // console.log('AdminChat/1' === topic)
                        console.log('message publish', topic, one_message);

                        client.publish(topic, JSON.stringify(one_message), { qos: 0 }, (error: any) => {
                            if (error) {
                                console.log('Publish error: ', error);
                            }
                        });
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

            const group_id = request.params.id;
            // get all messages belongs to this group
            const message = await this.ChatMessageRepository.createQueryBuilder('message')
                // .innerJoin('message.group', 'group', 'group.id=:group_id', { group_id })
                // .select([
                //     'message.createdDate',
                //     'message.latest',
                //     'message.message',
                //     'message.message_type',
                //     'message.from_id',
                //     'user.name',
                //     'message.from_id',
                // ])
                .where('message.group=:group_id', { group_id })
                .innerJoinAndSelect('message.from', 'member')
                .leftJoinAndSelect('member.executive', 'executive')
                .leftJoinAndSelect('member.user', 'user')
                .getMany();

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
