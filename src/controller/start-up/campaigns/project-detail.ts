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

      const user = Jwt.decode(req.cookies.token);
      delete user.role;

      // find campaign

      const campaigns = await this.projectDetailRepository.findOne({
        where: {
          is_active: true,
          is_published: false,
          user: user[0].id,
        },
      });

      await this.projectDetailRepository
        .createQueryBuilder()
        .update(Campaigns)
        .set({
          description,
          challenges,
          faq,
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

  // list basic info
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      // find user
      const user = Jwt.decode(req.cookies.token);
      delete user.role;
      //   find basic info
      const basicCampaigns = await this.projectDetailRepository.findOne({
        select: ["id", "description", "challenges", "faq"],
        where: {
          is_published: false,
          user: user[0].id,
        },
      });
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
