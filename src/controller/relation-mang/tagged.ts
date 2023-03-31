import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
// import { rmAdmin } from "../../entity/rmAdmin";
import { Tagged } from "../../entity/tagged";
import { Campaigns } from "../../entity/campaigns";
import { Users } from "../../entity/Users";
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

      const campaign = await this.taggedRepository
        .createQueryBuilder("tagged")
        .innerJoinAndSelect("tagged.StartUp", "startup")
        .innerJoin("tagged.RelationManager", "relationManager")
        .where("relationManager.id = :id AND tagged.is_active=true", {
          id: user[0].id,
        })
        .getMany();

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
        campaign
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

      const campaign = await this.userRepository
        .createQueryBuilder("startup")
        .innerJoin("startup.tagged", "tagged")
        .innerJoinAndSelect("startup.campaign", "campaign")
        .addSelect(
          `(SELECT COUNT(*) FROM funds where funds.campaignId=campaign.id LIMIT 1) as investors`
        )
        // .where("tagged.rm_id = :id AND tagged.is_active=true", {
        //   id: user[0].id,
        // })
        .getRawMany();

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
        campaign
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
