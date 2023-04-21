import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
// import { rmAdmin } from "../../entity/rmAdmin";
import { Tagged } from "../../entity/tagged";
import { Campaigns } from "../../entity/campaigns";
import { Users } from "../../entity/Users";
import { Funds } from "../../entity/funds";
import { TaggedSalesStartup } from "../../entity/taggedSalesStartup";
import { LegalStatusStartup } from "../../entity/legalStatusStartup";
import { LegalStatusInvestor } from "../../entity/legalStatusInvestor";
const { genToken } = require("../../utils/jsonwebtoken");
const responseMessage = require("../../configs/response");
const crypto = require("crypto");
const msg = require("../../configs/message");
const Jwt = require("../../utils/jsonwebtoken");
const sendEmail = require("../../utils/nodemailer/email");

export class TaggedSalesController {
    //   private userRepository = AppDataSource.getRepository(rmAdmin);
    private taggedRepository = AppDataSource.getRepository(Tagged);
    private campaignRepository = AppDataSource.getRepository(Campaigns);
    private userRepository = AppDataSource.getRepository(Users);
    private fundsRepository = AppDataSource.getRepository(Funds);
    private taggedSalesStartup = AppDataSource.getRepository(TaggedSalesStartup);
    private legalStatusStartupRepo = AppDataSource.getRepository(LegalStatusStartup);
    private legalStatusInvestorRepo = AppDataSource.getRepository(LegalStatusInvestor);

    //   list all users
    async all(request: Request, response: Response, next: NextFunction) {
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
            console.log("user", user);

            let dbQuery = this.campaignRepository
                .createQueryBuilder('campaign')
                .leftJoinAndSelect('campaign.location', "location")
                .leftJoinAndSelect('campaign.user', "StartUp", "StartUp.is_active=true")
                .leftJoinAndSelect('StartUp.taggedSalesStartup', 'tagged', 'tagged.is_active=true')
                .leftJoinAndSelect('tagged.Sales', "Sales", "Sales.is_active=true")
                // .leftJoinAndSelect('user.campaign', 'campaign')
                // .leftJoinAndSelect('user.tagged', 'tagged')
                // .leftJoinAndSelect('user.fund', 'fund')
                .select([
                    "campaign.title",
                    "StartUp.id",
                    "StartUp.company_name",
                    "StartUp.sector",
                    "location.name",
                    "location.country",
                    "campaign.createdDate",
                    "campaign.deal_size",
                    "campaign.goal_amount",
                    "campaign.id"
                ])
                .addSelect(
                    "(SELECT SUM(funds.fund_amount) FROM funds WHERE funds.campaignId=campaign.id AND funds.is_active = true)",
                    "fund_amount"
                )
                .addSelect(
                    "(SELECT COUNT(*) FROM funds WHERE funds.campaignId=campaign.id AND funds.is_active = true)",
                    "fund_count"
                )
                .where('tagged.sales_id = :id AND tagged.is_active=true', { id: user[0].id })
                .distinct();

            if (request.query.stage) {
                console.log(request.query.stage);
                dbQuery.andWhere("stage_of_business=:stage", {
                    stage: request.query.stage,
                });
            }
            if (request.query.country) {
                console.log(request.query.country);
                dbQuery.andWhere("startup.country=:country", {
                    country: request.query.country,
                });
            }
            if (request.query.from_date && request.query.to_date) {
                const formatDate = (date) => {
                    let convertedDate = new Date(date);
                    // .toISOString();
                    // .replace(/T/, " ") // replace T with a space
                    // .replace(/\..+/, "");
                    return convertedDate;
                };

                dbQuery.andWhere("startup.created_date > :start_dates  ", {
                    start_dates: formatDate(request.query.from_date),
                });
                dbQuery.andWhere("startup.created_date < :end_date ", {
                    end_date: formatDate(request.query.to_date),
                });
            }

            const total_count = await dbQuery.getCount();
            const campaign = await dbQuery
                .offset(
                    request.query.page
                        ? Number(request.query.page) *
                        (request.query.limit ? Number(request.query.limit) : 10)
                        : 0
                )
                .limit(request.query.limit ? Number(request.query.limit) : 10)
                .getRawMany();

            return responseMessage.responseWithData(
                true,
                200,
                msg.campaignListSuccess,
                {
                    total_count: total_count,
                    data: { campaign },
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

    async getOne(request: Request, response: Response, next: NextFunction) {
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

            const campaignId = request.params.id;

            const user = Jwt.decode(token);
            console.log("user", user);

            const campaign = await this.campaignRepository
                .createQueryBuilder('campaign')
                .leftJoinAndSelect('campaign.location', "location")
                .leftJoinAndSelect('campaign.user', "StartUp", "StartUp.is_active=true")
                .select([
                    "campaign.title",
                    "StartUp.id",
                    "StartUp.company_name",
                    "StartUp.sector",
                    "location.name",
                    "location.country",
                    "campaign.createdDate",
                    "campaign.deal_size",
                    "campaign.goal_amount",
                    "campaign.id"
                ])
                .addSelect(
                    "(SELECT SUM(funds.fund_amount) FROM funds WHERE funds.campaignId=campaign.id AND funds.is_active = true)",
                    "fund_amount"
                )
                .addSelect(
                    "(SELECT COUNT(*) FROM funds WHERE funds.campaignId=campaign.id AND funds.is_active = true)",
                    "fund_count"
                )
                .where('campaign.id = :id', { id: campaignId }).getRawOne();

            const investors = await this.fundsRepository
                .createQueryBuilder('funds').where('funds.campaignId = :id', { id: campaignId }).getMany()



            return responseMessage.responseWithData(
                true,
                200,
                msg.campaignListSuccess,
                {
                    data: { campaign, investors },
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

    //   fundingstatus all users
    async fundingStatus(request: Request, response: Response, next: NextFunction) {
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
            console.log("user", user);

            let dbQuery = this.taggedSalesStartup
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.StartUp', "StartUp", "StartUp.is_active=true")
                .leftJoinAndSelect('StartUp.campaign', 'campaign', 'campaign.is_active=true')
                .select([
                    "StartUp.id",
                    "StartUp.first_name",
                    "StartUp.last_name",
                    "StartUp.city",
                    "StartUp.country",
                    "StartUp.company_name",
                    "StartUp.stage_of_business",
                    "StartUp.sector",
                    "StartUp.created_date",
                    "campaign.id",
                    "campaign.title",
                    "campaign.goal_amount",
                    "campaign.deal_size",
                    "campaign.status",
                    "campaign.createdDate"
                ])
                .addSelect(
                    "(SELECT SUM(funds.fund_amount) FROM funds WHERE funds.campaignId=campaign.id AND funds.is_active = true)",
                    "fund_amount"
                )


            if (request.query.stage) {
                console.log(request.query.stage);
                dbQuery.andWhere("stage_of_business=:stage", {
                    stage: request.query.stage,
                });
            }
            if (request.query.country) {
                console.log(request.query.country);
                dbQuery.andWhere("startup.country=:country", {
                    country: request.query.country,
                });
            }
            if (request.query.from_date && request.query.to_date) {
                const formatDate = (date) => {
                    let convertedDate = new Date(date);
                    // .toISOString();
                    // .replace(/T/, " ") // replace T with a space
                    // .replace(/\..+/, "");
                    return convertedDate;
                };

                dbQuery.andWhere("startup.created_date > :start_dates  ", {
                    start_dates: formatDate(request.query.from_date),
                });
                dbQuery.andWhere("startup.created_date < :end_date ", {
                    end_date: formatDate(request.query.to_date),
                });
            }

            const total_count = await dbQuery.getCount();
            const campaign = await dbQuery
                .offset(
                    request.query.page
                        ? Number(request.query.page) *
                        (request.query.limit ? Number(request.query.limit) : 10)
                        : 0
                )
                .limit(request.query.limit ? Number(request.query.limit) : 10)
                .getRawMany();

            if (campaign.length === 0) {
                return responseMessage.responseMessage(
                    false,
                    400,
                    msg.campaignListFailed
                );
            }
            return responseMessage.responseWithData(
                true,
                200,
                msg.campaignListSuccess,
                {
                    total_count: total_count,
                    data: { campaign },
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

    //   meetingstatus all users
    async meetingStatus(request: Request, response: Response, next: NextFunction) {
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
            console.log("user", user);

            let dbQuery = this.taggedSalesStartup
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.StartUp', "StartUp", "StartUp.is_active=true")
                .leftJoinAndSelect('StartUp.campaign', 'campaign', 'campaign.is_active=true')
                .leftJoinAndSelect('StartUp.fund', 'fund')
                .leftJoinAndSelect('fund.investor', 'investor')
                .leftJoinAndSelect('campaign.meeting', 'meeting')

                .select([
                    "investor.id",
                    "investor.first_name",
                    "investor.last_name",
                    "investor.city",
                    "investor.country",
                    "investor.company_name",
                    "investor.stage_of_business",
                    "investor.created_date",
                    "meeting.id",
                    "meeting.query",
                    "meeting.feedback",
                    "meeting.status",
                    "meeting.meeting_date",
                    "meeting.createdDate"
                ])

            if (request.query.stage) {
                console.log(request.query.stage);
                dbQuery.andWhere("stage_of_business=:stage", {
                    stage: request.query.stage,
                });
            }
            if (request.query.country) {
                console.log(request.query.country);
                dbQuery.andWhere("startup.country=:country", {
                    country: request.query.country,
                });
            }
            if (request.query.from_date && request.query.to_date) {
                const formatDate = (date) => {
                    let convertedDate = new Date(date);
                    // .toISOString();
                    // .replace(/T/, " ") // replace T with a space
                    // .replace(/\..+/, "");
                    return convertedDate;
                };

                dbQuery.andWhere("startup.created_date > :start_dates  ", {
                    start_dates: formatDate(request.query.from_date),
                });
                dbQuery.andWhere("startup.created_date < :end_date ", {
                    end_date: formatDate(request.query.to_date),
                });
            }

            const total_count = await dbQuery.getCount();
            const campaign = await dbQuery
                .offset(
                    request.query.page
                        ? Number(request.query.page) *
                        (request.query.limit ? Number(request.query.limit) : 10)
                        : 0
                )
                .limit(request.query.limit ? Number(request.query.limit) : 10)
                .getRawMany();


            if (campaign.length === 0) {
                return responseMessage.responseMessage(
                    false,
                    400,
                    msg.campaignListFailed
                );
            }
            return responseMessage.responseWithData(
                true,
                200,
                msg.campaignListSuccess,
                {
                    total_count: total_count,
                    data: { campaign },
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

    //   legalStatusStartup all users

    async legalStatusStartupGet(request: Request, response: Response, next: NextFunction) {
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
            console.log("user", user);

            let dbQuery = this.taggedSalesStartup
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.StartUp', "StartUp", "StartUp.is_active=true")
                .leftJoinAndSelect('StartUp.legalStatusStartup', "legalStatusStartup")


                .select([
                    "StartUp.id",
                    "StartUp.first_name",
                    "StartUp.last_name",
                    "StartUp.city",
                    "StartUp.country",
                    "StartUp.company_name",
                    "StartUp.stage_of_business",
                    "StartUp.sector",
                    "StartUp.created_date",
                    "legalStatusStartup.mail_mobile",
                    "legalStatusStartup.bankDetails",
                    "legalStatusStartup.pitchDeck",
                    "legalStatusStartup.documents",
                ])

            if (request.query.stage) {
                console.log(request.query.stage);
                dbQuery.andWhere("stage_of_business=:stage", {
                    stage: request.query.stage,
                });
            }
            if (request.query.country) {
                console.log(request.query.country);
                dbQuery.andWhere("startup.country=:country", {
                    country: request.query.country,
                });
            }
            if (request.query.from_date && request.query.to_date) {
                const formatDate = (date) => {
                    let convertedDate = new Date(date);
                    // .toISOString();
                    // .replace(/T/, " ") // replace T with a space
                    // .replace(/\..+/, "");
                    return convertedDate;
                };

                dbQuery.andWhere("startup.created_date > :start_dates  ", {
                    start_dates: formatDate(request.query.from_date),
                });
                dbQuery.andWhere("startup.created_date < :end_date ", {
                    end_date: formatDate(request.query.to_date),
                });
            }

            const total_count = await dbQuery.getCount();
            const campaign = await dbQuery
                .offset(
                    request.query.page
                        ? Number(request.query.page) *
                        (request.query.limit ? Number(request.query.limit) : 10)
                        : 0
                )
                .limit(request.query.limit ? Number(request.query.limit) : 10)
                .getRawMany();


            if (campaign.length === 0) {
                return responseMessage.responseMessage(
                    false,
                    400,
                    msg.campaignListFailed
                );
            }
            return responseMessage.responseWithData(
                true,
                200,
                msg.campaignListSuccess,
                {
                    total_count: total_count,
                    data: { campaign },
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

    //   legalStatusStartup Post data users
    async legalStatusStartup(request: Request, response: Response, next: NextFunction) {
        try {

            console.log('thisis sda', request.body);
            const { startup_id, mail_mobile, bankDetails, pitchDeck, documents } = request.body;

            const legalStatusStartup = {
                User: startup_id,
                mail_mobile: mail_mobile,
                bankDetails: bankDetails,
                pitchDeck: pitchDeck,
                documents: documents
            };

            await this.legalStatusStartupRepo
                .upsert([legalStatusStartup], ['User']);


            return responseMessage.responseWithData(
                true,
                200,
                msg.campaignListSuccess,

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

    //   legalStatusInvestor all users
    async legalStatusInvestorGet(request: Request, response: Response, next: NextFunction) {
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
            console.log("user", user);

            let dbQuery = this.taggedSalesStartup
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.StartUp', "StartUp", "StartUp.is_active=true")
                .leftJoinAndSelect('StartUp.fund', 'fund')
                .leftJoinAndSelect('fund.investor', 'investor')
                .leftJoinAndSelect('StartUp.legalStatusInvestor', "legalStatusInvestor")

                .select([
                    "StartUp.id",
                    "StartUp.first_name",
                    "StartUp.last_name",
                    "StartUp.city",
                    "StartUp.country",
                    "StartUp.company_name",
                    "StartUp.stage_of_business",
                    "StartUp.sector",
                    "StartUp.created_date",
                    "investor.id",
                    "investor.first_name",
                    "investor.last_name",
                    "investor.city",
                    "investor.country",
                    "investor.company_name",
                    "investor.stage_of_business",
                    "investor.sector",
                    "investor.created_date",
                    "legalStatusInvestor.mail_mobile",
                    "legalStatusInvestor.bankDetails",
                    "legalStatusInvestor.dealDocument1",
                    "legalStatusInvestor.dealDocument2"
                ])

            if (request.query.stage) {
                console.log(request.query.stage);
                dbQuery.andWhere("stage_of_business=:stage", {
                    stage: request.query.stage,
                });
            }
            if (request.query.country) {
                console.log(request.query.country);
                dbQuery.andWhere("startup.country=:country", {
                    country: request.query.country,
                });
            }
            if (request.query.from_date && request.query.to_date) {
                const formatDate = (date) => {
                    let convertedDate = new Date(date);
                    // .toISOString();
                    // .replace(/T/, " ") // replace T with a space
                    // .replace(/\..+/, "");
                    return convertedDate;
                };

                dbQuery.andWhere("startup.created_date > :start_dates  ", {
                    start_dates: formatDate(request.query.from_date),
                });
                dbQuery.andWhere("startup.created_date < :end_date ", {
                    end_date: formatDate(request.query.to_date),
                });
            }

            const total_count = await dbQuery.getCount();
            const campaign = await dbQuery
                .offset(
                    request.query.page
                        ? Number(request.query.page) *
                        (request.query.limit ? Number(request.query.limit) : 10)
                        : 0
                )
                .limit(request.query.limit ? Number(request.query.limit) : 10)
                .getRawMany();


            if (campaign.length === 0) {
                return responseMessage.responseMessage(
                    false,
                    400,
                    msg.campaignListFailed
                );
            }
            return responseMessage.responseWithData(
                true,
                200,
                msg.campaignListSuccess,
                {
                    total_count: total_count,
                    data: { campaign },
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

    //   legalStatusStartup Post data users
    async legalStatusInvestor(request: Request, response: Response, next: NextFunction) {
        try {

            console.log('thisis sda', request.body);
            const { startup_id, mail_mobile, bankDetails, dealDocument1, dealDocument2 } = request.body;

            const legalStatusInvestor = {
                User: startup_id,
                mail_mobile: mail_mobile,
                bankDetails: bankDetails,
                dealDocument1: dealDocument1,
                dealDocument2: dealDocument2
            };

            await this.legalStatusInvestorRepo
                .upsert([legalStatusInvestor], ['User']);


            return responseMessage.responseWithData(
                true,
                200,
                msg.campaignListSuccess,

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
