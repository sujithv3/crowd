// created by : vijay
// purpose : start up campaign funds module create update and list

import { AppDataSource } from "../../../data-source";
import { NextFunction, Request, Response } from "express";
import { Campaigns } from "../../../entity/campaigns";
const responseMessage = require("../../../configs/response");
const msg = require("../../../configs/message");
const Jwt = require("../../../utils/jsonwebtoken");

export class fundsController {
  private fundsRepository = AppDataSource.getRepository(Campaigns);

  //   create funds
  async create(req: any, res: Response, next: NextFunction) {
    try {
      const {
        id,
        goal_amount,
        min_invest,
        max_invest,
        currency,
        deal_size,

        start_date,
        end_date,
        duration,
        fund_document,
      } = req.body;

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

      // find campaign

      const campaigns = await this.fundsRepository
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

      await this.fundsRepository
        .createQueryBuilder()
        .update(Campaigns)
        .set({
          goal_amount: Number(goal_amount),
          min_invest: Number(min_invest),
          max_invest: Number(max_invest),
          currency,
          deal_size,

          start_date: new Date(start_date),
          end_date: new Date(end_date),
          duration,
          fund_document: req.file ? req.file.location : fund_document,
        })
        .where("id = :id", { id: id ? id : campaigns.id })
        .execute();

      return responseMessage.responseMessage(
        true,
        200,
        msg.fundCampaignCreateSuccess
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.fundCampaignCreateFailed,
        err
      );
    }
  }

  // list basic info
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      // find user
      const user = Jwt.decode(req.cookies.token);
      delete user.role;
      //   find basic info
      const basicCampaigns = await this.fundsRepository
        .createQueryBuilder("campaign")
        .where(
          "campaign.user_id=:id AND campaign.is_active=true AND campaign.is_published=false",
          {
            id: user[0].id,
          }
        )

        .select([
          "campaign.id",
          "campaign.goal_amount",
          "campaign.min_invest",
          "campaign.max_invest",
          "campaign.currency",
          "campaign.deal_size",
          "campaign.start_date",
          "campaign.end_date",
          "campaign.duration",
          "campaign.fund_document",
        ])
        .getOne();

      return responseMessage.responseWithData(
        true,
        200,
        msg.fundCampaignListSuccess,
        basicCampaigns
      );
    } catch (err) {
      console.log(err);
      return responseMessage.responseWithData(
        false,
        400,
        msg.fundCampaignListFailed,
        err
      );
    }
  }
}
