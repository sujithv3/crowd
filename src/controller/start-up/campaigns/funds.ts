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
        contact_number,
        start_date,
        end_date,
        duration,
        fund_document,
      } = req.body;

      // get user id

      const user = Jwt.decode(req.cookies.token);
      delete user.role;

      // find campaign

      const campaigns = await this.fundsRepository.findOne({
        where: {
          is_active: true,
          is_published: false,
          user: user[0].id,
        },
      });

      await this.fundsRepository
        .createQueryBuilder()
        .update(Campaigns)
        .set({
          goal_amount: Number(goal_amount),
          min_invest: Number(min_invest),
          max_invest: Number(max_invest),
          currency,
          deal_size,
          contact_number,
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
      const basicCampaigns = await this.fundsRepository.findOne({
        select: [
          "id",
          "goal_amount",
          "min_invest",
          "max_invest",
          "currency",
          "deal_size",
          "contact_number",
          "start_date",
          "end_date",
          "duration",
          "fund_document",
        ],
        where: {
          is_published: false,
          user: user[0].id,
        },
      });
      return responseMessage.responseWithData(
        true,
        200,
        msg.fundCampaignListSuccess,
        basicCampaigns
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.fundCampaignListFailed,
        err
      );
    }
  }
}
