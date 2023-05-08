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
import { Funds } from "../../entity/funds";
import { ChatGroup, GROUP_TYPE, GROUP_STATUS } from "../../entity/chatGroup";
import { ChatMessage, MESSAGE_TYPE } from "../../entity/chatMessages";
import { ChatGroupMember, MEMBER_TYPE } from "../../entity/chatGroupMembers";

const mqtt = require('mqtt');


const qos = 1;
// const host = '127.0.0.1';
const host = '3.109.250.135';
const clientId = 'AdecMqttserver' + Math.random().toString(36).substring(2, 10);
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
const client = mqtt.connect(url, mqttOptions);

export class ChatApiController {
    private userRepository = AppDataSource.getRepository(Users);
    private ChatOnlineRepository = AppDataSource.getRepository(ChatOnline);
    private ChatMessageRepository = AppDataSource.getRepository(ChatMessage);
    private ChatGroupMemberRepository = AppDataSource.getRepository(ChatGroupMember);
    private ChatGroupRepository = AppDataSource.getRepository(ChatGroup);
    private CampaignsRepository = AppDataSource.getRepository(Campaigns);
    private fundsRepository = AppDataSource.getRepository(Funds);
    private client;

    constructor() {
        this.client = client;
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
            token = request.headers.authorization.slice(7);
            const user = Jwt.decode(token);
            // get all groups
            const members = await this.ChatGroupRepository
                .createQueryBuilder("group")
                .select([
                    'group.id',
                    'group.type',
                    'group.status',
                    'group.count',
                    'group.title',
                    'group.is_active',
                    'group.is_deleted',
                    'members.unread',
                    'members.user_type',
                    'user.id',
                    'user.first_name',
                    'user.last_name',
                    'user.company_name',
                    'user.profile',
                    'executive.id',
                    'executive.first_name',
                    'executive.last_name',
                    'executive.profile',
                    'message.createdDate',
                    'message.message',
                    'message.message_type',
                    'userOnline.user_type',
                    'executiveOnline.user_type',
                    'campaign.id',
                    'campaign.project_image',
                ])
                .leftJoin('group.members', 'members')
                .leftJoin('group.campaign', 'campaign')
                // .addSelect('SELECT message from chat_message WHERE ')
                .leftJoin('group.messages', 'message', 'message.latest=1')
                .leftJoin('members.user', 'user')
                .leftJoin("user.online", "userOnline")
                .leftJoin("members.executive", "executive")
                .leftJoin("executive.online", "executiveOnline")
                .leftJoin('group.members', 'members2', 'members2.user_type="STARTUP"')
                .leftJoin('members2.user', 'startup', 'startup.role_id=1')
                .innerJoin("startup.tagged", "tagged")
                .where("tagged.rm_id = :id AND tagged.is_active=true AND group.is_active=true AND group.is_deleted=false", {
                    id: user[0].id,
                })
                .getMany();

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

    async getInvestorUsers(request: Request, res: Response, next: NextFunction) {
        try {
            // const client = this.initConnection();
            // client.publish(topic, payload, { qos }, (error: any) => {
            //     if (error) {
            //         console.log('Publish error: ', error);
            //     }
            // });
            let token: any;
            token = request.headers.authorization.slice(7);

            const user = Jwt.decode(token);
            // console.log('user', user);
            const members = await this.ChatGroupRepository
                .createQueryBuilder("group")
                .select([
                    'group.id',
                    'group.type',
                    'group.status',
                    'group.count',
                    'group.title',
                    'group.is_active',
                    'group.is_deleted',
                    'members.unread',
                    'members.user_type',
                    'user.id',
                    'user.first_name',
                    'user.last_name',
                    'user.company_name',
                    'user.profile',
                    'executive.id',
                    'executive.first_name',
                    'executive.last_name',
                    'executive.profile',
                    'message.createdDate',
                    'message.message',
                    'message.message_type',
                    'userOnline.user_type',
                    'executiveOnline.user_type',
                    'campaign.id',
                    'campaign.project_image',
                ])
                .leftJoin('group.members', 'members')
                .leftJoin('group.campaign', 'campaign')
                // .addSelect('SELECT message from chat_message WHERE ')
                .leftJoin('group.messages', 'message', 'message.latest=1')
                .leftJoin('members.user', 'user')
                .leftJoin("user.online", "userOnline")
                .leftJoin("members.executive", "executive")
                .leftJoin("executive.online", "executiveOnline")

                .leftJoin('group.members', 'members2', 'members2.user_type="INVESTOR"')
                // .leftJoin('members2.user', 'investor')
                .where("members2.user_id=:id AND group.is_active=true AND group.is_deleted=false", {
                    id: user[0].id,
                })
                .getMany();
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

    async getStartupUsers(request: Request, res: Response, next: NextFunction) {
        try {
            // const client = this.initConnection();
            // client.publish(topic, payload, { qos }, (error: any) => {
            //     if (error) {
            //         console.log('Publish error: ', error);
            //     }
            // });
            let token: any;
            token = request.headers.authorization.slice(7);

            const user = Jwt.decode(token);
            // get all groups
            // const members = await this.ChatGroupRepository
            //     .createQueryBuilder("group")
            //     .innerJoinAndSelect('group.members', 'members')
            //     .innerJoinAndSelect('group.members', 'user')
            //     .leftJoinAndSelect('group.messages', 'message', 'message.latest=1')
            //     .leftJoinAndSelect('members.executive', 'executive')
            //     .innerJoinAndSelect("executive.tagged", "tagged")
            //     .leftJoinAndSelect("executive.online", "online")
            //     .where("tagged.start_up_id = :id AND user.user_id = :id AND tagged.is_active=true", {
            //         id: user[0].id,
            //     })
            //     .getRawMany();

            const members = await this.ChatGroupRepository
                .createQueryBuilder("group")
                .select([
                    'group.id',
                    'group.type',
                    'group.status',
                    'group.count',
                    'group.title',
                    'group.is_active',
                    'group.is_deleted',
                    'members.unread',
                    'members.user_type',
                    'user.id',
                    'user.first_name',
                    'user.last_name',
                    'user.company_name',
                    'user.profile',
                    'executive.id',
                    'executive.first_name',
                    'executive.last_name',
                    'executive.profile',
                    'message.createdDate',
                    'message.message',
                    'message.message_type',
                    'userOnline.user_type',
                    'executiveOnline.user_type',
                    'campaign.id',
                    'campaign.project_image',
                ])
                .leftJoin('group.members', 'members')
                .leftJoin('group.campaign', 'campaign')
                // .addSelect('SELECT message from chat_message WHERE ')
                .leftJoin('group.messages', 'message', 'message.latest=1')
                .leftJoin('members.user', 'user')
                .leftJoin("user.online", "userOnline")
                .leftJoin("members.executive", "executive")
                .leftJoin("executive.online", "executiveOnline")

                .leftJoin('group.members', 'members2', 'members2.user_type="STARTUP"')
                .leftJoin('members2.user', 'startup', 'startup.role_id=1')
                .innerJoin("startup.tagged", "tagged")
                .where("tagged.start_up_id = :id AND tagged.is_active=true AND group.is_active=true AND group.is_deleted=false", {
                    id: user[0].id,
                })
                .getMany();

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
            // console.log('request.headers.authorization', request.headers.authorization)
            token = request.headers.authorization.slice(7);

            const user = Jwt.decode(token);

            // const group_member = this.ChatGroupMemberRepository.createQueryBuilder('members')
            //     .innerJoin('members.group', 'group', 'members.user_id=:user_id', req.body.startup_id) // find startup with members
            //     .innerJoin('members.group', 'group', 'members.user_id=:user_id', req.body.startup_id) // find investor with members
            //     .where('group.type=:type AND members.user_id=:user_id', { type: GROUP_TYPE }).execute();
            const group_id = request.body.group_id;

            // find group Member id
            console.log('user.....', user);

            let current_member = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                .where('member.execuive_id=:user_id AND member.group_id=:id', { user_id: user[0].id, id: group_id }) // find logged in user with members
                .getOne();



            if (current_member) {

                // update other message to 0 for latest message func
                await this.ChatMessageRepository.createQueryBuilder('message').update().set({
                    latest: false
                }).where('group_id=:id', { id: group_id }).execute();

                // update unread Status
                const qb = this.ChatGroupMemberRepository.createQueryBuilder()
                await qb.update().set({
                    unread: () => qb.escape(`unread`) + " + 1"
                }).where('group_id=:id AND id!=:member_id', { id: group_id, member_id: current_member.id }).execute();


                const message = await this.ChatMessageRepository.save({
                    message: request.body.message,
                    from: { id: current_member.id },
                    group: { id: group_id }
                });

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
                one_message.group_id = group_id;
                one_message.type = 'chat';

                for (let i = 0; i < members.length; i++) {
                    const activeMember = members[i];
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
                    // console.log('client?.publish', this.client?.publish);
                    if (this.client?.publish) {
                        // console.log('AdminChat/1' === topic)
                        // console.log('message publish', topic, one_message);

                        this.client.publish(topic, JSON.stringify(one_message), { qos: 0 }, (error: any) => {
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
            token = request.headers.authorization.slice(7);

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

                // update unread Status
                const qb = this.ChatGroupMemberRepository.createQueryBuilder()
                await qb.update().set({
                    unread: () => qb.escape(`unread`) + " + 1"
                }).where('group_id=:id AND id!=:member_id', { id: group_id, member_id: current_member.id }).execute();

                const message = await this.ChatMessageRepository.save({
                    message: request.body.message,
                    from: { id: current_member.id },
                    group: { id: group_id }
                });
                // const client: any = await this.initConnection();
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
                one_message.group_id = group_id;
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
                    console.log('client?.publish', this.client?.publish);
                    if (this.client?.publish) {
                        // console.log('AdminChat/1' === topic)
                        console.log('message publish', topic, one_message);

                        this.client.publish(topic, JSON.stringify(one_message), { qos: 0 }, (error: any) => {
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
            token = request.headers.authorization.slice(7);

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
                .orderBy('message.id', 'ASC')
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

    async getNotification(request) {
        try {
            let token: any;
            token = request.headers.authorization.slice(7);

            const user = Jwt.decode(token);
            console.log('user', user[0]);

            let message = {
                unreadCount: 0,
                data: {}
            };
            if (user[0] && user[0].role) {
                console.log('user[0].role.name', user[0].role.name);
                if (user[0].role.name === 'start-up' || user[0].role.name === 'invester') {

                    if (request.query.group_id && request.query.group_id > 0) {

                        let current_member = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                            .where('member.user_id=:user_id AND member.group_id=:id', { user_id: user[0].id, id: request.query.group_id }) // find logged in user with members
                            .getOne();

                        await this.ChatGroupMemberRepository.createQueryBuilder().update().set({
                            unread: 0
                        }).where('group_id=:id AND id=:member_id', { id: request.query.group_id, member_id: current_member.id }).execute();
                    }

                    const unreadData = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                        .select(['member.group_id', 'member.unread'])
                        .innerJoin('member.user', 'user')
                        .where('user.id=:id AND member.unread>0', { id: user[0].id }).getRawMany();
                    if (unreadData && Array.isArray(unreadData)) {
                        unreadData.forEach((item: any) => {
                            message.unreadCount += item.member_unread;
                            message.data['grp' + item.group_id] = item.member_unread;
                        })
                    }
                } else {

                    if (request.query.group_id && request.query.group_id > 0) {

                        let current_member = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                            .where('member.execuive_id=:user_id AND member.group_id=:id', { user_id: user[0].id, id: request.query.group_id }) // find logged in user with members
                            .getOne();

                        await this.ChatGroupMemberRepository.createQueryBuilder().update().set({
                            unread: 0
                        }).where('group_id=:id AND id=:member_id', { id: request.query.group_id, member_id: current_member.id }).execute();
                    }

                    const unreadData = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                        .select(['member.group_id', 'member.unread'])
                        .innerJoin('member.executive', 'user')
                        .where('user.id=:id AND member.unread>0', { id: user[0].id }).getRawMany();
                    if (unreadData && Array.isArray(unreadData)) {
                        unreadData.forEach((item: any) => {
                            message.unreadCount += item.member_unread;
                            message.data['grp' + item.group_id] = item.member_unread;
                        })
                    }

                }

            }

            return responseMessage.responseWithData(
                true,
                200,
                msg.chat_post_success,
                message
            );
        }
        catch (error) {
            console.log(error);
            return responseMessage.responseWithData(
                false,
                400,
                msg.chat_post_success,
                error
            );
        }
    }

    async getInvestorList(request: Request, response: Response, next: NextFunction) {
        try {
            let token: any;
            token = request.headers.authorization.slice(7);

            const user = Jwt.decode(token);

            const group_id = request.params.id;

            //get startup id for group
            const startup = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                .select(['member.user_id'])
                .where('member.group_id=:id AND member.user_type=:type', { id: group_id, type: USER_TYPE.STARTUP }).getRawOne();

            // get invested Investors
            // const queryBuilder = this.fundsRepository.createQueryBuilder('campaign')
            //     .innerJoin("campaign.myDeals", "mydeals")
            //     .innerJoin("mydeals.user", "user")
            //     .innerJoin("user.city", "city")
            //     .where('campaign.is_deleted=false AND campaign.is_published=true AND campaign.user_id=:id', { id: startup.user_id });

            const campaign = this.fundsRepository
                .createQueryBuilder("fund")
                .innerJoinAndSelect("fund.investor", "investor")
                .leftJoinAndSelect("investor.city", "city")
                .innerJoinAndSelect(
                    "fund.campaign",
                    "campaign",
                    "campaign.is_deleted=false AND campaign.is_published=true"
                )
                .innerJoinAndSelect("campaign.location", "location")
                // .innerJoin("campaign.user", "startup")
                // .leftJoin("startup.city", "startupCity")
                .where("campaign.user_id=:id", {
                    id: startup.user_id
                });

            if (request.query.country && request.query.country !== "all") {
                campaign.andWhere("investor.country=:country", {
                    country: request.query.country,
                });
            }

            // const totalQuery = queryBuilder.clone();

            // const total_count = await totalQuery.select('count(*) as cnt').getRawOne();

            // queryBuilder.select([
            //     'campaign.id as campId',
            //     'campaign.title',
            //     'user.id',
            //     'user.first_name',
            //     'user.last_name',
            //     'user.country',
            //     'city.name',
            //     'city.state_code',
            // ]).
            // addSelect('(SELECT SUM(funds) FROM WHERE funds campaign_id)');
            // const data = await queryBuilder.offset(
            //     request.query.page
            //         ? Number(request.query.page) *
            //         (request.query.limit ? Number(request.query.limit) : 10)
            //         : 0
            // )
            //     .limit(request.query.limit ? Number(request.query.limit) : 10).getRawMany();
            const totalQuery = campaign.clone();
            const total_count = await totalQuery.select('COUNT(DISTINCT investor.id, campaign.id) as cnt').getRawOne();

            campaign.select([
                "investor.id",
                "investor.first_name",
                "investor.last_name",
                // "investor.city",
                "city.name",
                "city.state_code",
                //   "startupCity.name",
                //   "startupCity.state_code",
                "investor.country",
                // "startup.company_name",
                //   "startup.stage_of_business",
                "campaign.title",
                "campaign.currency",
                "campaign.id",
                "location.name",
                "location.country",
                "fund.fund_amount",
            ])
                .groupBy('investor.id')
                .addGroupBy('campaign.id');

            // const totalQuery = campaign.clone();
            // const total_count = await totalQuery.getCount();
            if (request.query.page && request.query.limit) {
                campaign
                    .offset(
                        request.query.page
                            ? Number(request.query.page) *
                            (request.query.limit ? Number(request.query.limit) : 10)
                            : 0
                    )
                    .limit(request.query.limit ? Number(request.query.limit) : 10);
            }

            const data = await campaign.getRawMany();

            return responseMessage.responseWithData(
                true,
                200,
                msg.userListSuccess,
                {
                    total_count: total_count.cnt,
                    data: data
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

    async createGroup(request: Request, response: Response, next: NextFunction) {
        try {
            let token: any;
            token = request.headers.authorization.slice(7);

            const user = Jwt.decode(token);

            const group_id = request.body.group_id;
            const investor_id = request.body.investor_id;
            const campaign_id = request.body.campaign_id;

            // check provided group is valid
            const group_exist = await this.ChatGroupRepository
                .createQueryBuilder('chat')
                .where('id=:id AND type=:type', {
                    id: group_id,
                    type: GROUP_TYPE.STARTUP
                }).getOne();
            console.log('group_exist', group_exist);

            const investor_exist = await this.userRepository
                .createQueryBuilder('user')
                .select([
                    'id',
                ])
                .where({
                    id: investor_id,
                }).getRawOne();

            const campaign_exists = await this.CampaignsRepository
                .createQueryBuilder('campaign')
                .select([
                    'campaign.id',
                ])
                .where({
                    id: campaign_id,
                }).getOne();
            console.log('campaign_exists', campaign_exists);

            if (group_exist && investor_exist && campaign_exists) {
                // get all members
                const all_members = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                    .where('group_id=:id', { id: group_exist.id })
                    .getRawMany();
                if (all_members && all_members.length > 0) {
                    console.log('all_members', all_members);
                    // get investor


                    // create Group Id

                    const group = await this.ChatGroupRepository.save({
                        type: GROUP_TYPE.GROUP,
                        count: 2,
                        campaign: { id: campaign_exists.id },
                        title: ''
                    });
                    // copy existing group members (2 members)
                    for (let i = 0; i < all_members.length; ++i) {
                        const current_member = all_members[i];
                        await this.ChatGroupMemberRepository.save({
                            user_type: current_member.member_user_type,
                            group: {
                                id: group.id,
                            },
                            user: {
                                id: current_member.member_user_id,
                            },
                            executive: {
                                id: current_member.member_execuive_id,
                            }
                        })
                    }

                    await this.ChatGroupMemberRepository.save({
                        user_type: MEMBER_TYPE.INVESTOR,
                        group: {
                            id: group.id,
                        },
                        user: {
                            id: investor_exist.id,
                        }
                    })


                    // add new memeber investor as 3 man group

                }

            }




            return responseMessage.responseWithData(
                true,
                200,
                msg.chat_create_success
            );
        } catch (err) {
            console.log(err);
            return responseMessage.responseWithData(
                false,
                400,
                msg.chat_create_failed,
                err
            );
        }
    }

    async rename(request: Request, response: Response, next: NextFunction) {
        try {
            let token: any;
            token = request.headers.authorization.slice(7);

            const user = Jwt.decode(token);

            const group_id = request.body.group_id;

            const name = request.body.name;

            // check provided group is valid
            const group_exist = await this.ChatGroupRepository
                .createQueryBuilder('chat')
                .where('id=:id AND type=:type', {
                    id: group_id,
                    type: GROUP_TYPE.GROUP
                }).getOne();

            let current_member = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                .where('member.execuive_id=:user_id AND member.group_id=:id', { user_id: user[0].id, id: group_id }) // find logged in user with members
                .getOne();


            if (group_exist && current_member) {
                console.log('rename works');
                await this.ChatGroupRepository
                    .createQueryBuilder('chat')
                    .update().set({
                        title: name
                    }).where('id=:id', { id: group_id }).execute();

                // get all members belongs to this group
                let members = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                    .leftJoinAndSelect('member.executive', 'executive')
                    .leftJoinAndSelect('member.user', 'user')
                    .where('member.group_id=:id', { id: group_id }) // find logged in user with members
                    .getRawMany();

                const payload = {
                    type: 'rename',
                    id: group_id,
                }

                for (let i = 0; i < members.length; i++) {
                    const activeMember = members[i];
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
                    console.log('client?.publish', this.client?.publish);
                    if (this.client?.publish) {
                        // console.log('AdminChat/1' === topic)
                        console.log('message publish', topic, payload);

                        this.client.publish(topic, JSON.stringify(payload), { qos: 0 }, (error: any) => {
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
                msg.userListSuccess
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

    async delete(request: Request, response: Response, next: NextFunction) {
        try {
            let token: any;
            token = request.headers.authorization.slice(7);

            const user = Jwt.decode(token);

            const group_id = request.body.group_id;


            let current_member = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                .where('member.execuive_id=:user_id AND member.group_id=:id', { user_id: user[0].id, id: group_id }) // find logged in user with members
                .getOne();
            console.log('current_member', current_member);

            // check provided group is valid
            const group_exist = await this.ChatGroupRepository
                .createQueryBuilder('chat')
                .where('id=:id AND type=:type', {
                    id: group_id,
                    type: GROUP_TYPE.GROUP
                }).getOne();
            console.log('group_exist', group_exist);

            if (group_exist && current_member) {

                // delete chat
                await this.ChatGroupRepository
                    .createQueryBuilder('chat')
                    .update().set({
                        is_deleted: true
                    }).where('id=:id', { id: group_id }).execute();

                // get all members belongs to this group
                let members = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                    .leftJoinAndSelect('member.executive', 'executive')
                    .leftJoinAndSelect('member.user', 'user')
                    .where('member.group_id=:id', { id: group_id }) // find logged in user with members
                    .getRawMany();

                const payload = {
                    type: 'delete',
                    id: group_id,
                }

                for (let i = 0; i < members.length; i++) {
                    const activeMember = members[i];
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
                    console.log('client?.publish', this.client?.publish);
                    if (this.client?.publish) {
                        // console.log('AdminChat/1' === topic)
                        console.log('message publish', topic, payload);

                        this.client.publish(topic, JSON.stringify(payload), { qos: 0 }, (error: any) => {
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
                msg.userListSuccess
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

    async activate(request: Request, response: Response, next: NextFunction) {
        try {
            let token: any;
            token = request.headers.authorization.slice(7);

            const user = Jwt.decode(token);

            const group_id = request.body.group_id;


            let current_member = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                .where('member.execuive_id=:user_id AND member.group_id=:id', { user_id: user[0].id, id: group_id }) // find logged in user with members
                .getOne();
            console.log('current_member', current_member);

            // check provided group is valid
            const group_exist = await this.ChatGroupRepository
                .createQueryBuilder('chat')
                .where('id=:id AND type=:type', {
                    id: group_id,
                    type: GROUP_TYPE.GROUP
                }).getOne();
            console.log('group_exist', group_exist);

            if (group_exist && current_member) {

                // Activate chat
                await this.ChatGroupRepository
                    .createQueryBuilder('chat')
                    .update().set({
                        status: GROUP_STATUS.ACTIVE
                    }).where('id=:id', { id: group_id }).execute();

                const message = await this.ChatMessageRepository.save({
                    message: 'Group is activated!',
                    message_type: MESSAGE_TYPE.ACTIVATE,
                    from: { id: current_member.id },
                    group: { id: group_id }
                });

                // get all members belongs to this group
                let members = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                    .leftJoinAndSelect('member.executive', 'executive')
                    .leftJoinAndSelect('member.user', 'user')
                    .where('member.group_id=:id', { id: group_id }) // find logged in user with members
                    .getRawMany();

                const one_message: any = await this.ChatMessageRepository.createQueryBuilder('message')
                    .where('message.id=:id', { id: message.id })
                    .innerJoinAndSelect('message.from', 'member')
                    .leftJoinAndSelect('member.executive', 'executive')
                    .leftJoinAndSelect('member.user', 'user')
                    .getOne();
                one_message.group_id = group_id;
                one_message.type = 'chat';

                for (let i = 0; i < members.length; i++) {
                    const activeMember = members[i];
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
                    console.log('client?.publish', this.client?.publish);
                    if (this.client?.publish) {
                        // console.log('AdminChat/1' === topic)
                        console.log('message publish', topic, one_message);

                        this.client.publish(topic, JSON.stringify(one_message), { qos: 0 }, (error: any) => {
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
                msg.userListSuccess
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

    async deactivate(request: Request, response: Response, next: NextFunction) {
        try {
            let token: any;
            token = request.headers.authorization.slice(7);

            const user = Jwt.decode(token);

            const group_id = request.body.group_id;


            let current_member = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                .where('member.execuive_id=:user_id AND member.group_id=:id', { user_id: user[0].id, id: group_id }) // find logged in user with members
                .getOne();
            console.log('current_member', current_member);

            // check provided group is valid
            const group_exist = await this.ChatGroupRepository
                .createQueryBuilder('chat')
                .where('id=:id AND type=:type', {
                    id: group_id,
                    type: GROUP_TYPE.GROUP
                }).getOne();
            console.log('group_exist', group_exist);

            if (group_exist && current_member) {

                // Activate chat
                await this.ChatGroupRepository
                    .createQueryBuilder('chat')
                    .update().set({
                        status: GROUP_STATUS.INACTIVE
                    }).where('id=:id', { id: group_id }).execute();

                const message = await this.ChatMessageRepository.save({
                    message: 'Group is DeActivated!',
                    message_type: MESSAGE_TYPE.DEACTIVATE,
                    from: { id: current_member.id },
                    group: { id: group_id }
                });

                // get all members belongs to this group
                let members = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                    .leftJoinAndSelect('member.executive', 'executive')
                    .leftJoinAndSelect('member.user', 'user')
                    .where('member.group_id=:id', { id: group_id }) // find logged in user with members
                    .getRawMany();

                const one_message: any = await this.ChatMessageRepository.createQueryBuilder('message')
                    .where('message.id=:id', { id: message.id })
                    .innerJoinAndSelect('message.from', 'member')
                    .leftJoinAndSelect('member.executive', 'executive')
                    .leftJoinAndSelect('member.user', 'user')
                    .getOne();
                one_message.group_id = group_id;
                one_message.type = 'chat';

                for (let i = 0; i < members.length; i++) {
                    const activeMember = members[i];
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
                    console.log('client?.publish', this.client?.publish);
                    if (this.client?.publish) {
                        // console.log('AdminChat/1' === topic)
                        console.log('message publish', topic, one_message);

                        this.client.publish(topic, JSON.stringify(one_message), { qos: 0 }, (error: any) => {
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
                msg.userListSuccess
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

    async postFile(request: any, response: Response, next: NextFunction) {
        try {
            let token: any;
            token = request.headers.authorization.slice(7);

            const user = Jwt.decode(token);

            const group_id = request.body.group_id;

            // console.log('req.files', request.files);
            // console.log('req.body', request.body)


            let current_member = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                .where('member.execuive_id=:user_id AND member.group_id=:id', { user_id: user[0].id, id: group_id }) // find logged in user with members
                .getOne();
            console.log('current_member', current_member);

            // check provided group is valid
            const group_exist = await this.ChatGroupRepository
                .createQueryBuilder('chat')
                .where('id=:id', {
                    id: group_id,
                }).getOne();
            console.log('group_exist', group_exist);

            if (group_exist && current_member && request.files[0]) {
                const file = request.files[0];
                const file_value = [];;
                file_value.push(file.location);
                file_value.push(file.originalname);

                let message_type = MESSAGE_TYPE.DOCUMENT;
                if (file.mimetype.includes('image/')) {
                    message_type = MESSAGE_TYPE.IMAGE;
                }


                const message = await this.ChatMessageRepository.save({
                    message: file_value.join(','),
                    message_type: message_type,
                    from: { id: current_member.id },
                    group: { id: group_id }
                });

                // get all members belongs to this group
                let members = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                    .leftJoinAndSelect('member.executive', 'executive')
                    .leftJoinAndSelect('member.user', 'user')
                    .where('member.group_id=:id', { id: group_id }) // find logged in user with members
                    .getRawMany();

                const one_message: any = await this.ChatMessageRepository.createQueryBuilder('message')
                    .where('message.id=:id', { id: message.id })
                    .innerJoinAndSelect('message.from', 'member')
                    .leftJoinAndSelect('member.executive', 'executive')
                    .leftJoinAndSelect('member.user', 'user')
                    .getOne();
                one_message.group_id = group_id;
                one_message.type = 'chat';

                for (let i = 0; i < members.length; i++) {
                    const activeMember = members[i];
                    let topic = '';
                    let profile = '';
                    if (activeMember.member_user_type == 'RM') {
                        topic = 'AdminChat/' + activeMember.executive_id;
                        profile = activeMember?.executive_profile
                    } else {
                        topic = 'chat/' + activeMember.user_id;
                        profile = activeMember?.user_profile
                    }
                    console.log('client?.publish', this.client?.publish);
                    if (this.client?.publish) {
                        // console.log('AdminChat/1' === topic)
                        console.log('message publish', topic, one_message);

                        this.client.publish(topic, JSON.stringify(one_message), { qos: 0 }, (error: any) => {
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
                msg.userListSuccess
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

    async postStartupFile(request: any, response: Response, next: NextFunction) {
        try {
            let token: any;
            token = request.headers.authorization.slice(7);

            const user = Jwt.decode(token);

            const group_id = request.body.group_id;

            // console.log('req.files', request.files);
            // console.log('req.body', request.body)


            let current_member = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                .where('member.user_id=:user_id AND member.group_id=:id', { user_id: user[0].id, id: group_id }) // find logged in user with members
                .getOne();
            console.log('current_member', current_member);

            // check provided group is valid
            const group_exist = await this.ChatGroupRepository
                .createQueryBuilder('chat')
                .where('id=:id', {
                    id: group_id,
                }).getOne();
            console.log('group_exist', group_exist, current_member);

            if (group_exist && current_member && request.files[0]) {
                const file = request.files[0];
                const file_value = [];;
                file_value.push(file.location);
                file_value.push(file.originalname);

                let message_type = MESSAGE_TYPE.DOCUMENT;
                if (file.mimetype.includes('image/')) {
                    message_type = MESSAGE_TYPE.IMAGE;
                }


                const message = await this.ChatMessageRepository.save({
                    message: file_value.join(','),
                    message_type: message_type,
                    from: { id: current_member.id },
                    group: { id: group_id }
                });

                // get all members belongs to this group
                let members = await this.ChatGroupMemberRepository.createQueryBuilder('member')
                    .leftJoinAndSelect('member.executive', 'executive')
                    .leftJoinAndSelect('member.user', 'user')
                    .where('member.group_id=:id', { id: group_id }) // find logged in user with members
                    .getRawMany();

                const one_message: any = await this.ChatMessageRepository.createQueryBuilder('message')
                    .where('message.id=:id', { id: message.id })
                    .innerJoinAndSelect('message.from', 'member')
                    .leftJoinAndSelect('member.executive', 'executive')
                    .leftJoinAndSelect('member.user', 'user')
                    .getOne();
                one_message.group_id = group_id;
                one_message.type = 'chat';

                for (let i = 0; i < members.length; i++) {
                    const activeMember = members[i];
                    let topic = '';
                    let profile = '';
                    if (activeMember.member_user_type == 'RM') {
                        topic = 'AdminChat/' + activeMember.executive_id;
                        profile = activeMember?.executive_profile
                    } else {
                        topic = 'chat/' + activeMember.user_id;
                        profile = activeMember?.user_profile
                    }
                    console.log('client?.publish', this.client?.publish);
                    if (this.client?.publish) {
                        // console.log('AdminChat/1' === topic)
                        console.log('message publish', topic, one_message);

                        this.client.publish(topic, JSON.stringify(one_message), { qos: 0 }, (error: any) => {
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
                msg.userListSuccess
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
