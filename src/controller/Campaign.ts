// created by : Muthukumar
// purpose : Campaign list for carousel view

import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Campaigns } from "../entity/campaigns";
const responseMessage = require("../configs/response");
const msg = require("../configs/message");

export class CampaignController {
  private CampaignRepository = AppDataSource.getRepository(Campaigns);

  // list all
  async get(request: Request, response: Response, next: NextFunction) {
    try {
      const campaignData = await this.CampaignRepository.find({
        where: {
          is_published: true,
        },
      });

      //   check category exist
      if (campaignData.length === 0) {
        return responseMessage.responseMessage(
          false,
          400,
          msg.campaignNotFound
        );
      }

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        campaignData
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.categoryListFailed,
        err
      );
    }
  }
}
