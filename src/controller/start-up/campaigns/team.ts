// created by : vijay
// purpose : start up campaign teams module create update and list

import { AppDataSource } from "../../../data-source";
import { NextFunction, Request, Response } from "express";
import { Campaigns } from "../../../entity/campaigns";
import { Teams } from "../../../entity/teams";
const responseMessage = require("../../../configs/response");
const msg = require("../../../configs/message");
const Jwt = require("../../../utils/jsonwebtoken");

export class teamController {
  private campaignRepository = AppDataSource.getRepository(Campaigns);
  private teamRepository = AppDataSource.getRepository(Teams);

  //   create project details
  async create(req: any, res: Response, next: NextFunction) {
    try {
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

      const campaigns = await this.campaignRepository
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

      // find team
      await this.teamRepository
        .createQueryBuilder()
        .delete()
        .where("campaign_id=:id", { id: campaigns.id })
        .execute();

      //   find tames

      for (let i = 0; i < req.body.length; i++) {
        const {
          id,
          first_name,
          last_name,
          join_date = new Date(),
          contact_number,
          summary,
          linkedin,
          email_id,
          // team_member_email,
          role,
          is_active = true,
          is_deleted = false,
        } = req.body[i];

        // create team table
        await this.teamRepository.save({
          first_name,
          last_name,
          join_date: new Date(join_date),
          contact_number,
          summary,
          linkedin,
          campaign: campaigns,
          email_id,
          team_member_email: null,
          role,
          createdDate: new Date(),
          updatedDate: new Date(),
          is_active,
          is_deleted,
        });
      }

      return responseMessage.responseMessage(
        true,
        200,
        msg.teamsCampaignCreateSuccess
      );
    } catch (err) {
      console.log(err);
      return responseMessage.responseWithData(
        false,
        400,
        msg.teamsCampaignCreateFailed,
        err
      );
    }
  }

  // list team table
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

      // find campaign

      const campaign = await this.campaignRepository
        .createQueryBuilder()
        .where("user_id=:id AND is_active=true AND is_published=false", {
          id: user[0].id,
        })
        .getOne();

      //   find team
      const basicCampaigns = await this.teamRepository
        .createQueryBuilder("team")
        .where("team.campaign = :id", { id: campaign.id })
        .getMany();

      return responseMessage.responseWithData(
        true,
        200,
        msg.teamsCampaignListSuccess,
        basicCampaigns
      );
    } catch (err) {
      console.log(err);
      return responseMessage.responseWithData(
        false,
        400,
        msg.teamsCampaignListFailed,
        err
      );
    }
  }
}
