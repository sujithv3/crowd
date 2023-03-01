// created by : vijay
// purpose : start up campaign payment verification module create update and list

import { AppDataSource } from "../../../data-source";
import { NextFunction, Request, Response } from "express";
import { Campaigns } from "../../../entity/campaigns";
const responseMessage = require("../../../configs/response");
const msg = require("../../../configs/message");
const Jwt = require("../../../utils/jsonwebtoken");

export class paymentVerificationController {
  private paymentVerificationRepository =
    AppDataSource.getRepository(Campaigns);

  //   create paymentVerification
  async create(req: any, res: Response, next: NextFunction) {
    try {
      const { id, business_type, contact_email_id, status } = req.body;

      // get user id

      const user = Jwt.decode(req.cookies.token);
      delete user.role;

      // find campaign

      const campaigns = await this.paymentVerificationRepository.findOne({
        where: {
          is_active: true,
          is_published: false,
          user: user[0].id,
        },
      });

      await this.paymentVerificationRepository
        .createQueryBuilder()
        .update(Campaigns)
        .set({
          business_type,
          contact_email_id,
          status,
        })
        .where("id = :id", { id: id ? id : campaigns.id })
        .execute();

      return responseMessage.responseMessage(
        true,
        200,
        msg.paymentVerificationCampaignCreateSuccess
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.paymentVerificationCampaignCreateFailed,
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
      const basicCampaigns = await this.paymentVerificationRepository.findOne({
        select: ["id", "business_type", "contact_email_id", "status"],
        where: {
          is_published: false,
          user: user[0].id,
        },
      });
      return responseMessage.responseWithData(
        true,
        200,
        msg.paymentVerificationCampaignListSuccess,
        basicCampaigns
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.paymentVerificationCampaignListFailed,
        err
      );
    }
  }
}
