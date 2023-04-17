import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
// import { rmAdmin } from "../../entity/rmAdmin";
import { Tagged } from "../../entity/tagged";
import { Campaigns } from "../../entity/campaigns";
import { Users } from "../../entity/Users";
import { Funds } from "../../entity/funds";
const { genToken } = require("../../utils/jsonwebtoken");
const responseMessage = require("../../configs/response");
const crypto = require("crypto");
const msg = require("../../configs/message");
const Jwt = require("../../utils/jsonwebtoken");
const sendEmail = require("../../utils/nodemailer/email");

export class TaggedController {
  //   private userRepository = AppDataSource.getRepository(rmAdmin);
  private taggedRepository = AppDataSource.getRepository(Tagged);
  private campaignRepository = AppDataSource.getRepository(Campaigns);
  private userRepository = AppDataSource.getRepository(Users);
  private fundsRepository = AppDataSource.getRepository(Funds);

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

      let dbQuery = this.userRepository
        .createQueryBuilder("startup")
        .innerJoinAndSelect("startup.tagged", "tagged")
        .where("tagged.rm_id = :id AND tagged.is_active=true", {
          id: user[0].id,
        });
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
          data: campaign,
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

  async funded(request: Request, response: Response, next: NextFunction) {
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

      // const campaign = await this.campaignRepository
      //   .createQueryBuilder("campaign")
      //   .select([
      //     "campaign.title",
      //     "startup.first_name",
      //     "startup.last_name",
      //     "location.name",
      //     "location.country",
      //     "campaign.createdDate",
      //     "campaign.goal_amount",
      //     "SUM(fund.fund_amount) as total_funded_amount",
      //   ])
      //   .leftJoin("campaign.location", "location")
      //   .innerJoin("campaign.user", "startup")
      //   .leftJoin("campaign.fund", "fund")
      //   .innerJoin("startup.tagged", "tagged")
      //   .loadRelationCountAndMap("campaign.fund", "campaign.fund")
      //   .where("tagged.rm_id = :id AND tagged.is_active=true", {
      //     id: user[0].id,
      //   })
      //   .getMany();

      const campaignQuery = this.campaignRepository
        .createQueryBuilder("campaign")
        .select([
          "campaign.id",
          "campaign.title",
          "startup.first_name",
          "startup.last_name",
          "startup.company_name",
          "startup.stage_of_business",
          "startup.sector",
          "location.name",
          "location.country",
          "campaign.createdDate",
          "campaign.goal_amount",
          "campaign.start_date",
          "campaign.deal_size",
        ])
        .leftJoin("campaign.location", "location")
        .innerJoin("campaign.user", "startup")
        // .leftJoin("campaign.fund", "fund")
        .innerJoin("startup.tagged", "tagged")
        .addSelect(
          "(SELECT SUM(funds.fund_amount) FROM funds WHERE funds.campaignId=campaign.id)",
          "fund_amount"
        )
        .addSelect(
          "(SELECT COUNT(*) FROM funds WHERE funds.campaignId=campaign.id)",
          "fund_count"
        )
        .where("tagged.rm_id = :id AND tagged.is_active=true", {
          id: user[0].id,
        });
      if (request.query.country) {
        campaignQuery.andWhere("location.country=:country", {
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

        console.log(request.query.from_date, request.query.to_date);

        campaignQuery.andWhere("campaign.start_date > :start_dates  ", {
          start_dates: formatDate(request.query.from_date),
        });
        campaignQuery.andWhere("campaign.start_date < :end_date ", {
          end_date: formatDate(request.query.to_date),
        });
      }
      if (typeof request.query.goal_amount === "string") {
        console.log(request.query.goal_amount);
        const range = request.query.goal_amount.split("-");
        const min = Number(range[0]);
        const max = Number(range[1]);
        if (!isNaN(min) && !isNaN(max)) {
          campaignQuery.andWhere("campaign.goal_amount BETWEEN :min AND :max", {
            min: min,
            max: max,
          });
        } else if (!isNaN(min) && isNaN(max)) {
          campaignQuery.andWhere("campaign.goal_amount > :min", {
            min: min,
          });
        }
      }
      // .getRawMany();
      const total_count = await campaignQuery.getCount();
      const data = await campaignQuery
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
          data: data,
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

  async fundedDetail(request: Request, response: Response, next: NextFunction) {
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
      const id = request.params.id;
      const campaign = await this.campaignRepository
        .createQueryBuilder("campaign")
        .select([
          "startup.first_name",
          "startup.last_name",
          "startup.company_name",
          "startup.stage_of_business",
          "startup.sector",
          "location.name",
          "location.country",
          "campaign.id",
          "campaign.goal_amount",
          "campaign.start_date",
          "campaign.deal_size",
        ])
        .leftJoin("campaign.location", "location")
        .innerJoin("campaign.user", "startup")
        .leftJoin("campaign.fund", "fund")
        .innerJoin("startup.tagged", "tagged")
        .addSelect(
          "(SELECT SUM(funds.fund_amount) FROM funds WHERE funds.campaignId=campaign.id)",
          "fund_amount"
        )
        .addSelect(
          "(SELECT COUNT(*) FROM funds WHERE funds.campaignId=campaign.id)",
          "fund_count"
        )

        .where(
          "campaign.id = :id AND tagged.rm_id = :userId AND tagged.is_active=true",
          {
            id: id,
            userId: user[0].id,
          }
        )
        .getRawOne();

      const funds = await this.fundsRepository
        .createQueryBuilder("funds")
        .select([
          "funds.id",
          "funds.fund_amount",
          "investor.first_name",
          "investor.last_name",
        ])
        .leftJoin("funds.investor", "investor")
        .where("funds.campaignId=:id", { id })
        .getMany();

      const data = {
        items: campaign,
        funds: funds,
      };

      // const campaign = await this.campaignRepository
      //   .createQueryBuilder("campaign")
      //   .innerJoinAndSelect("campaign.user", "user")
      //   .innerJoin("user.tagged", "tagged")
      //   .loadRelationCountAndMap("campaign.fund", "campaign.fund")
      //   .innerJoin("tagged.RelationManager", "relationManager")
      //   .where("tagged.rm_id = :id AND tagged.is_active=true", {
      //     id: user[0].id,
      //   })
      //   .getMany();

      if (!campaign) {
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
        data
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
}
