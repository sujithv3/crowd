// created by : vijay
// purpose : category table create update delete and list

import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Meeting } from "../entity/meeting";
import { Campaigns } from "../entity/campaigns";
const responseMessage = require("../configs/response");
const Jwt = require("../utils/jsonwebtoken");
const msg = require("../configs/message");

export class MeetingController {
  private Meeting = AppDataSource.getRepository(Meeting);
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

      await this.Meeting.createQueryBuilder()
        .insert()
        .values({
          campaign: campaign_id,
          user: user[0].id,
          is_active: true,
          is_deleted: false,
        })
        .orIgnore()
        .execute();
      return responseMessage.responseWithData(true, 200, msg.createMeeting);
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.createMeetingFail,
        err
      );
    }
  }

  async remove(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.body;
      const my_deals = await this.Meeting.findOneBy({ id: parseInt(id) });

      if (!my_deals) {
        return responseMessage.responseMessage(
          false,
          400,
          msg.locationNotFound
        );
      }

      await this.Meeting.remove(my_deals);
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
}
