// created by : vijay
// purpose : category table create update delete and list

import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { MyDeals } from "../entity/mydeals";
import { Campaigns } from "../entity/campaigns";
const responseMessage = require("../configs/response");
const Jwt = require("../utils/jsonwebtoken");
const msg = require("../configs/message");

export class MydealsController {
  private MyDeals = AppDataSource.getRepository(MyDeals);
  private campaignRepository = AppDataSource.getRepository(Campaigns);

  // list all
  async add(request: Request, response: Response, next: NextFunction) {
    try {
      const { campaign_id } = request.body;

      // get user id
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
      // create my_deals

      await this.MyDeals.createQueryBuilder()
        .insert()
        .values({
          campaign: campaign_id,
          user: user[0].id,
          is_active: true,
          is_deleted: false,
        })
        .orIgnore()
        .execute();
      return responseMessage.responseWithData(true, 200, msg.createMyDeals);
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.createMyDealFail,
        err
      );
    }
  }

  async remove(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.body;
      const my_deals = await this.MyDeals.findOneBy({ id: parseInt(id) });

      if (!my_deals) {
        return responseMessage.responseMessage(
          false,
          400,
          msg.locationNotFound
        );
      }

      await this.MyDeals.remove(my_deals);
      return responseMessage.responseWithData(
        true,
        200,
        msg.RemoveMyDealSuccess
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.RemoveMyDealFail,
        err
      );
    }
  }


  async list(request: Request, response: Response, next: NextFunction) {
    try {
      // get user id
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

      const campaignQuery = this.campaignRepository
        .createQueryBuilder("campaign")
        .innerJoinAndSelect("campaign.myDeals", "myDeals")
        .leftJoinAndSelect(
          "campaign.meeting",
          "meeting",
          "meeting.campaign_id=campaign.id AND meeting.user_id=:id AND meeting.is_active=true",
          { id: user[0].id }
        )
        .where("myDeals.user_id = :id", { id: user[0].id })
        .leftJoin("campaign.user", "startup")
        .addSelect([
          'startup.id',
          'startup.first_name',
          'startup.last_name',
          'startup.company_name',
        ])
        .leftJoinAndSelect("campaign.category", "category")
        .leftJoinAndSelect("campaign.subcategory", "subcategory")
        .loadRelationCountAndMap("campaign.fund", "campaign.fund");

      if (request.query.filter == "meeting") {
        campaignQuery.andWhere("meeting.user_id=:id", { id: user[0].id });
      }

      const totalQuery = campaignQuery.clone();
      const total_count = await totalQuery.getCount();

      const campaign = await campaignQuery
        .skip(
          request.query.page
            ? (Number(request.query.page) - 1) *
            (request.query.limit ? Number(request.query.limit) : 10)
            : 0
        )
        .take(request.query.limit ? Number(request.query.limit) : 10)
        .getMany()

      return responseMessage.responseWithData(
        true,
        200,
        msg.listDashboard,
        { total_count, campaign }
      );
    } catch (err) {
      console.log(err);

      return responseMessage.responseWithData(
        false,
        400,
        msg.listDashboardFailed,
        err
      );
    }
  }
}
