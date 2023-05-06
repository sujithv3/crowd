// created by : vijay
// purpose : category table create update delete and list

import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Meeting } from "../entity/meeting";
import { Campaigns } from "../entity/campaigns";
import { MyDeals } from "../entity/mydeals";
import axios from "axios";
const responseMessage = require("../configs/response");
const Jwt = require("../utils/jsonwebtoken");
const msg = require("../configs/message");

export class MeetingController {
  private MeetingRepository = AppDataSource.getRepository(Meeting);
  private campaignRepository = AppDataSource.getRepository(Campaigns);
  private MyDealsRepository = AppDataSource.getRepository(MyDeals);

  // list one
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
          "rm.email_id",
          "rm.id",
        ])
        .innerJoin("campaign.user", "startup")
        .innerJoin("startup.tagged", "tagged")
        .innerJoin("tagged.RelationManager", "rm")
        .where("campaign.id=:campaignId AND tagged.is_active=true", {
          campaignId: id,
        })
        .getRawOne();

      // get rm calendly url
      const getRmDetails = await axios.get(
        process.env.CALENDLY_BASE_URL +
          "/organizations/" +
          process.env.ORGANIZATION_ID +
          "/invitations?email=" +
          campaignData.rm_email_id,
        {
          headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` },
        }
      );
      // console.log("getRmDetails", getRmDetails.data);
      if (getRmDetails.data.collection.length != 0) {
        const user = getRmDetails.data.collection[0];
        if (user?.status === "accepted") {
          const getRmCalendlyUrl: any = await axios.get(user.user, {
            headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` },
          });
          campaignData.scheduling_url =
            getRmCalendlyUrl.data.resource.scheduling_url +
            "/" +
            process.env.EVENT_NAME;
          // console.log(getRmCalendlyUrl.data.resource.scheduling_url);
        }
      }

      // get meeting details

      const MeetingExist = await this.MeetingRepository.createQueryBuilder(
        "meeting"
      )
        .where(
          "meeting.user_id=:user_id AND meeting.rm_id=:rm_id AND meeting.campaign_id=:campaign_id AND meeting.meeting_date > :meeting_date",
          {
            user_id: user[0].id,
            rm_id: campaignData.rm_id,
            campaign_id: campaignData.campaign_id,
            meeting_date: new Date(),
          }
        )
        .getOne();

      console.log(Meeting);

      const data = {
        meetingData,
        campaignData,
        MeetingExist,
      };

      return responseMessage.responseWithData(
        true,
        200,
        msg.createMeeting,
        data
      );
    } catch (err) {
      console.log(err);
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
      console.log(request.body);
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
      const currentDate = new Date();
      currentDate.setHours(0);
      currentDate.setMinutes(0);
      currentDate.setSeconds(0);

      let diff = currentDate.getTime() - meeting_date;
      if (diff > 0) {
        return responseMessage.responseWithData(
          false,
          400,
          msg.meetingPastDate,
          "Meeting Date cannot be past"
        );
      }

      if (date1 > date2) {
        return responseMessage.responseWithData(
          false,
          400,
          msg.meetingEndTime,
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
        // change all active meeting to inactive

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

      console.log(user[0].id);

      await this.MeetingRepository.createQueryBuilder()
        .insert()
        .values({
          user: user[0].id,
          campaign: campaign_id,
          meeting_date: request.body.meeting_date,
          name: request.body.name,
          Relationship_manager: request.body.rm_id,
          start_time: request.body.start_time,
          end_time: request.body.end_time,
          location: request.body.location,
          url: request.body.url,
          is_active: true,
          is_deleted: false,
        })
        .execute();

      // check if meeting exists
      const mydelas = await this.MyDealsRepository.createQueryBuilder()
        .where(
          "user_id=:userid AND campaign_id=:id AND is_active=true AND is_deleted=false",
          {
            userid: user[0].id,
            id: campaign_id,
          }
        )
        .getOne();
      // Add to My Deals
      if (!mydelas) {
        await this.MyDealsRepository.createQueryBuilder()
          .insert()
          .values({
            campaign: campaign_id,
            user: user[0].id,
            is_active: true,
            is_deleted: false,
          })
          .orIgnore()
          .execute();
      }
      if (meetingExists) {
        return responseMessage.responseWithData(
          true,
          200,
          msg.reScheduleMeeting
        );
      } else {
        return responseMessage.responseWithData(true, 200, msg.createMeeting);
      }
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

  // list investor meeting details
  async investorMeeting(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
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

      const month = new Date().getMonth() + 1;
      // console.log(month);

      const MeetingDetails = await this.MeetingRepository.createQueryBuilder(
        "meeting"
      )
        .where(
          "meeting.user_id=:user_id AND EXTRACT(month FROM meeting.meeting_date) = :month OR EXTRACT(month FROM meeting.meeting_date) = :next_month",
          { user_id: user[0].id, month: month, next_month: month + 1 }
        )
        .leftJoinAndSelect("meeting.campaign", "campaign")
        .select(["meeting", "campaign.id", "campaign.title"])
        .getMany();
      // console.log();
      return responseMessage.responseWithData(
        true,
        200,
        msg.createMeeting,
        MeetingDetails
      );
    } catch (err) {
      console.log(err);
      return responseMessage.responseWithData(
        false,
        400,
        msg.createMeetingFail,
        err
      );
    }
  }
}
