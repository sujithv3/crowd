// created by : vijay
// purpose : start up campaign project detail module create update and list

import { AppDataSource } from "../../../data-source";
import { NextFunction, Request, Response } from "express";
import { Campaigns } from "../../../entity/campaigns";
const responseMessage = require("../../../configs/response");
const msg = require("../../../configs/message");
const Jwt = require("../../../utils/jsonwebtoken");

export class projectDetailController {
  private projectDetailRepository = AppDataSource.getRepository(Campaigns);

  //   create project details
  async create(req: any, res: Response, next: NextFunction) {
    try {
      const { id, description, challenges, faq } = req.body;

      // get user id
      let token: any;
      if (
        typeof req.cookies.token === "undefined" ||
        req.cookies.token === null
      ) {
        token = req.headers.authorization.slice(7);
      } else {
        token = req.cookies.token;
      }

      const user = Jwt.decode(token);
      delete user.role;
      console.log(faq)
      // find campaign

      const campaigns = await this.projectDetailRepository
        .createQueryBuilder()
        .where("user_id=:id AND is_active=true AND is_published=false", {
          id: user[0].id,
        })
        .getOne();

      if (!campaigns) {
        return responseMessage.responseMessage(
          false,
          400,
          msg.createStartCampaignFirst
        );
      }

      await this.projectDetailRepository
        .createQueryBuilder()
        .update(Campaigns)
        .set({
          description,
          challenges,
          faq: faq ?? [],
        })
        .where("id = :id", { id: id ? id : campaigns.id })
        .execute();

      return responseMessage.responseMessage(
        true,
        200,
        msg.projectDetailsCampaignCreateSuccess
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.projectDetailsCampaignCreateFailed,
        err
      );
    }
  }

  // list project info
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      // find user
      let token: any;
      if (
        typeof req.cookies.token === "undefined" ||
        req.cookies.token === null
      ) {
        token = req.headers.authorization.slice(7);
      } else {
        token = req.cookies.token;
      }

      const user = Jwt.decode(token);
      delete user.role;
      //   find basic info
      const basicCampaigns = await this.projectDetailRepository
        .createQueryBuilder("campaign")
        .where(
          "campaign.user_id=:id AND campaign.is_active=true AND campaign.is_published=false",
          {
            id: user[0].id,
          }
        )
        .select([
          "campaign.id",
          "campaign.description",
          "campaign.challenges",
          "campaign.faq",
        ])
        .getOne();

      return responseMessage.responseWithData(
        true,
        200,
        msg.projectDetailsCampaignListSuccess,
        basicCampaigns
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.projectDetailsCampaignListFailed,
        err
      );
    }
  }
}
