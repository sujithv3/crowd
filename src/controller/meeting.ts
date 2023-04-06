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
  private MeetingRepository = AppDataSource.getRepository(Meeting);
  private campaignRepository = AppDataSource.getRepository(Campaigns);

  // list all
  async getone(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.params;

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
      // Get Existing Meeting

      const meetingData = await this.MeetingRepository.createQueryBuilder()
        .where(
          "user_id=:userid AND campaign_id=:campaignId AND is_active=true",
          {
            userid: user[0].id,
            campaignId: id,
          }
        )
        .getOne();

      // Get RM for Campaign
      const campaignData = await this.campaignRepository
        .createQueryBuilder("campaign")
        .select([
          "campaign.id",
          "campaign.title",
          "rm.first_name",
          "rm.last_name",
        ])
        .innerJoin("campaign.user", "startup")
        .innerJoin("startup.tagged", "tagged")
        .innerJoin("tagged.RelationManager", "rm")
        .where("campaign.id=:campaignId AND tagged.is_active=true", {
          campaignId: id,
        })
        .getRawOne();

      const data = {
        meetingData,
        campaignData,
      };

      return responseMessage.responseWithData(
        true,
        200,
        msg.createMeeting,
        data
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.createMeetingFail,
        err
      );
    }
  }

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

      let date1 = new Date(request.body.start_time).getTime();
      let date2 = new Date(request.body.end_time).getTime();
      let meeting_date = new Date(request.body.meeting_date).getTime();

      let diff = new Date().getTime() - meeting_date;
      if (diff > 0) {
        return responseMessage.responseWithData(
          false,
          400,
          msg.createFundFail,
          "Meeting Date cannot be past"
        );
      }

      if (date1 > date2) {
        return responseMessage.responseWithData(
          false,
          400,
          msg.createFundFail,
          "End Time Should be greater than start time"
        );
      }

      const meetingExists =
        await this.MeetingRepository.createQueryBuilder().where(
          "user_id=:userid AND meeting_date > NOW() AND campaign_id=:campaignId AND is_active=true",
          {
            userid: user[0].id,
            campaignId: campaign_id,
          }
        );

      if (meetingExists) {
        // reschedule meeting
        // change active meeting to inactive

        await this.MeetingRepository.createQueryBuilder()
          .update()
          .set({
            is_active: false,
          })
          .where(
            "user_id=:userid AND campaign_id=:campaignId AND is_active=true",
            {
              userid: user[0].id,
              campaignId: campaign_id,
            }
          )
          .execute();
      }

      await this.MeetingRepository.createQueryBuilder()
        .insert()
        .values({
          user: user[0].id,
          campaign: campaign_id,
          meeting_date: request.body.meeting_date,
          start_time: request.body.start_time,
          end_time: request.body.end_time,
          is_active: true,
          is_deleted: false,
        })
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
      const my_deals = await this.MeetingRepository.findOneBy({
        id: parseInt(id),
      });

      if (!my_deals) {
        return responseMessage.responseMessage(
          false,
          400,
          msg.locationNotFound
        );
      }

      await this.MeetingRepository.remove(my_deals);
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
