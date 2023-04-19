import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
// import { rmAdmin } from "../../entity/rmAdmin";
import { Tagged } from "../../entity/tagged";
import { Campaigns } from "../../entity/campaigns";
import { Users } from "../../entity/Users";
import { Funds } from "../../entity/funds";
import { TaggedSalesStartup } from "../../entity/taggedSalesStartup";
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

            let dbQuery = this.taggedSalesStartup
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.StartUp', "StartUp", "StartUp.is_active=true")
                .leftJoinAndSelect('StartUp.campaign', 'campaign', 'campaign.is_active=true')
                .leftJoinAndSelect('StartUp.fund', 'fund')
                .leftJoinAndSelect('fund.investor', 'investor')
                .leftJoinAndSelect('user.Sales', "Sales", "Sales.is_active=true")
                // .leftJoinAndSelect('user.campaign', 'campaign')
                // .leftJoinAndSelect('user.tagged', 'tagged')
                // .leftJoinAndSelect('user.fund', 'fund')
                .select([
                    "StartUp.id",
                    "StartUp.company_name",
                    "StartUp.sector",
                    "StartUp.city",
                    "StartUp.country",
                    "StartUp.created_date",
                    "campaign.goal_amount",
                    "campaign.id",
                    "fund.fund_amount",
                    "investor.id",
                    "investor.first_name",
                    "investor.last_name",
                    "investor.city",
                    "investor.country",
                ])
                .addSelect(
                    "(SELECT SUM(funds.fund_amount) FROM funds WHERE funds.campaignId=campaign.id AND funds.is_active = true)",
                    "fund_amount"
                )
                .addSelect(
                    "(SELECT COUNT(*) FROM funds WHERE funds.campaignId=campaign.id AND funds.is_active = true)",
                    "fund_count"
                )
                // .where('tagged.rm_id = :id', { id: user[0].id })
                .where('user.sales_id = :id AND user.is_active=true', { id: 21 })
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

            // const campaign1 = await this.campaignRepository
            //     .createQueryBuilder("campaign")
            //     .select([
            //         "startup.first_name",
            //         "startup.last_name",
            //         "startup.company_name",
            //         "startup.stage_of_business",
            //         "startup.sector",
            //         "location.name",
            //         "location.country",
            //         "campaign.id",
            //         "campaign.goal_amount",
            //         "campaign.start_date",
            //         "campaign.deal_size",
            //     ])
            //     .leftJoin("campaign.location", "location")
            //     .innerJoin("campaign.user", "startup")
            //     .leftJoin("campaign.fund", "fund")
            //     .innerJoin("startup.tagged", "tagged")
            //     .addSelect(
            //         "(SELECT SUM(funds.fund_amount) FROM funds WHERE funds.campaignId=campaign.id)",
            //         "fund_amount"
            //     )
            //     .addSelect(
            //         "(SELECT COUNT(*) FROM funds WHERE funds.campaignId=campaign.id)",
            //         "fund_count"
            //     )
            //     .getMany();

            // const funds = await this.fundsRepository
            //     .createQueryBuilder("funds")
            //     .select([
            //         "funds.id",
            //         "funds.fund_amount",
            //         "investor.first_name",
            //         "investor.last_name",
            //     ])
            //     .leftJoin("funds.investor", "investor")
            //     .getMany();

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

    //   list one users
    async one(request: Request, response: Response, next: NextFunction) {
        const id = parseInt(request.params.id);
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

            const startup = await this.userRepository
                .createQueryBuilder("startup")
                .select([
                    "startup.id",
                    "startup.first_name",
                    "startup.last_name",
                    "startup.city",
                    "startup.country",
                    "startup.created_date",
                    "campaign.id",
                    "campaign.files",
                ])
                .innerJoin("startup.tagged", "tagged")
                .where(
                    "startup.id=:id AND tagged.rm_id = :userId AND tagged.is_active=true",
                    {
                        id: id,
                        userId: user[0].id,
                    }
                )
                .leftJoin("startup.campaign", "campaign")
                .leftJoin("campaign.fund", "fund")
                .leftJoin("fund.investor", "investor")
                .getOne();

            const investor = await this.userRepository
                .createQueryBuilder("investor")
                .select("investor.id")
                .distinct(true)
                .addSelect([
                    // "fund.id",
                    // "fund.fund_amount",
                    // "fund.investor",
                    "investor.id",
                    "investor.first_name",
                    "investor.last_name",
                    "investor.city",
                    "investor.country",
                    "investor.is_active",
                    "investor.created_date",
                ])
                .innerJoin("investor.fund", "fund")
                .innerJoin("fund.campaign", "campaign")
                .innerJoin("campaign.user", "campaignowner")
                .innerJoin("campaignowner.tagged", "tagged")
                .where(
                    "campaignowner.id=:id AND tagged.rm_id = :userId AND tagged.is_active=true",
                    {
                        id: id,
                        userId: user[0].id,
                    }
                )
                .getMany();
            const campaign = {
                startup,
                investor,
            };
            return responseMessage.responseWithData(
                true,
                200,
                msg.campaignListSuccess,
                campaign
            );
        } catch (error) {
            console.log(error);
            return responseMessage.responseWithData(
                false,
                400,
                msg.userListFailed,
                error
            );
        }
    }

    //   legalstatus all users
    async legalStatus(request: Request, response: Response, next: NextFunction) {
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

            let dbQuery = this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.tagged', 'tagged')
                .leftJoinAndSelect('user.campaign', 'campaign')
                .leftJoinAndSelect('user.fund', 'fund')
                .select([
                    "user.id",
                    "user.company_name",
                    "user.sector",
                    "user.city",
                    "user.country",
                    "user.created_date",
                    "campaign.goal_amount"
                ])
                .addSelect(
                    "(SELECT SUM(funds.fund_amount) FROM funds WHERE funds.campaignId=campaign.id)",
                    "fund_amount"
                )
                .addSelect(
                    "(SELECT COUNT(*) FROM funds WHERE funds.campaignId=campaign.id)",
                    "fund_count"
                )
                .where('tagged.rm_id = :id AND tagged.is_active=true', { id: user[0].id })

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

            // const campaign1 = await this.campaignRepository
            //     .createQueryBuilder("campaign")
            //     .select([
            //         "startup.first_name",
            //         "startup.last_name",
            //         "startup.company_name",
            //         "startup.stage_of_business",
            //         "startup.sector",
            //         "location.name",
            //         "location.country",
            //         "campaign.id",
            //         "campaign.goal_amount",
            //         "campaign.start_date",
            //         "campaign.deal_size",
            //     ])
            //     .leftJoin("campaign.location", "location")
            //     .innerJoin("campaign.user", "startup")
            //     .leftJoin("campaign.fund", "fund")
            //     .innerJoin("startup.tagged", "tagged")
            //     .addSelect(
            //         "(SELECT SUM(funds.fund_amount) FROM funds WHERE funds.campaignId=campaign.id)",
            //         "fund_amount"
            //     )
            //     .addSelect(
            //         "(SELECT COUNT(*) FROM funds WHERE funds.campaignId=campaign.id)",
            //         "fund_count"
            //     )
            //     .getMany();

            // const funds = await this.fundsRepository
            //     .createQueryBuilder("funds")
            //     .select([
            //         "funds.id",
            //         "funds.fund_amount",
            //         "investor.first_name",
            //         "investor.last_name",
            //     ])
            //     .leftJoin("funds.investor", "investor")
            //     .getMany();

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
}
