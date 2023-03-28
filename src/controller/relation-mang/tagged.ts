import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
// import { rmAdmin } from "../../entity/rmAdmin";
import { Tagged } from "../../entity/tagged";
import { Campaigns } from "../../entity/campaigns";
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

      const campaign = await this.campaignRepository
        .createQueryBuilder("campaign")
        .innerJoinAndSelect("campaign.tagged", "myDeals")
        .where(
          "campaign.id=:id AND tagged.user_id = :userId AND tagged.is_active=true",
          {
            id: id,
            userId: user[0].id,
          }
        )
        .leftJoinAndSelect("campaign.category", "category")
        .leftJoinAndSelect("campaign.subcategory", "subcategory")
        .leftJoinAndSelect("campaign.fund", "fund")
        .getOne();

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
