import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
// import { rmAdmin } from "../../entity/rmAdmin";
import { Tagged } from "../../entity/tagged";
import { Campaigns } from "../../entity/campaigns";
import { Funds } from "../../entity/funds";
import { Users } from "../../entity/Users";
const { genToken } = require("../../utils/jsonwebtoken");
const responseMessage = require("../../configs/response");
const crypto = require("crypto");
const msg = require("../../configs/message");
const Jwt = require("../../utils/jsonwebtoken");
const sendEmail = require("../../utils/nodemailer/email");

export class InvestorController {
  //   private userRepository = AppDataSource.getRepository(rmAdmin);
  private taggedRepository = AppDataSource.getRepository(Tagged);
  private campaignRepository = AppDataSource.getRepository(Campaigns);
  private userRepository = AppDataSource.getRepository(Users);
  private fundsRepository = AppDataSource.getRepository(Funds);

  //   list all users
  async interested(request: Request, response: Response, next: NextFunction) {
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

      const campaign = await this.userRepository
        .createQueryBuilder("user")
        .innerJoin("user.tagged", "tagged")
        .where("tagged.id = :id AND tagged.is_active=true", {
          id: user[0].id,
        })
        .select([
          "user.id",
          "user.first_name",
          "user.last_name",
          "user.city",
          "user.country",
        ])
        .addSelect(
          "(SELECT SUM(funds.fund_amount) FROM funds WHERE funds.investorId=user.id)",
          "fund_amount"
        );
      const total_count = await campaign.getCount();
      if (request.query.page && request.query.limit) {
        campaign
          .skip(
            request.query.page
              ? (Number(request.query.page) - 1) *
                  (request.query.limit ? Number(request.query.limit) : 10)
              : 0
          )
          .take(request.query.limit ? Number(request.query.limit) : 10);
      }

      const data = await campaign.getRawMany();

      const item = {
        total_count,
        data,
      };

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        item
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
      console.log("user", user);

      const campaign = await this.fundsRepository
        .createQueryBuilder("fund")
        .innerJoinAndSelect("fund.investor", "investor")
        .innerJoinAndSelect("fund.campaign", "campaign")
        .innerJoinAndSelect("campaign.location", "location")
        .innerJoin("investor.tagged", "tagged")
        .where("tagged.id = :id AND tagged.is_active=true", {
          id: user[0].id,
        })
        .select([
          "investor.id",
          "investor.first_name",
          "investor.last_name",
          "investor.city",
          "investor.country",
          "campaign.title",
          "location.name",
          "location.country",
          "fund.fund_amount",
        ]);
      const total_count = await campaign.getCount();
      if (request.query.page && request.query.limit) {
        campaign
          .skip(
            request.query.page
              ? (Number(request.query.page) - 1) *
                  (request.query.limit ? Number(request.query.limit) : 10)
              : 0
          )
          .take(request.query.limit ? Number(request.query.limit) : 10);
      }

      const data = await campaign.getRawMany();

      const item = {
        total_count,
        data,
      };

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        item
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

  async campaign(request: Request, response: Response, next: NextFunction) {
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

      const id = parseInt(request.params.id);
      const user = Jwt.decode(token);

      console.log("user", user);

      const campaign = await this.campaignRepository
        .createQueryBuilder("campaign")
        .innerJoinAndSelect("campaign.fund", "fund")
        .innerJoinAndSelect("campaign.location", "location")
        .where("fund.investorId = :id", {
          id: id,
        })
        .select([
          "campaign.title",
          "location.name",
          "location.country",
          "fund.fund_amount as fund_amount",
        ]);
      const total_count = await campaign.getCount();
      if (request.query.page && request.query.limit) {
        campaign
          .skip(
            request.query.page
              ? (Number(request.query.page) - 1) *
                  (request.query.limit ? Number(request.query.limit) : 10)
              : 0
          )
          .take(request.query.limit ? Number(request.query.limit) : 10);
      }

      const data = await campaign.getRawMany();

      const item = {
        total_count,
        data,
      };

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        item
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
