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
      let token: any;
      if (
        typeof req.cookies.token === "undefined" ||
        req.cookies.token === null
      ) {
        if (!req.headers.authorization) {
          return res
            .status(412)
            .send(
              responseMessage.responseMessage(
                false,
                402,
                msg.user_login_required
              )
            );
        } else {
          token = req.headers.authorization.slice(7);
        }
      } else {
        token = req.cookies.token;
      }

      const user = Jwt.decode(token);
      delete user.role;

      // find campaign

      const campaigns = await this.paymentVerificationRepository
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

      await this.paymentVerificationRepository
        .createQueryBuilder()
        .update(Campaigns)
        .set({
          payment_business_type: business_type,
          payment_contact_email_id: contact_email_id,
          citizen_status: status,
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
      //   find basic info
      const basicCampaigns = await this.paymentVerificationRepository
        .createQueryBuilder("")
        .where("user_id=:id AND is_active=true AND is_published=false", {
          id: user[0].id,
        })
        .select([
          "id",
          "payment_contact_email_id AS contact_email_id",
          "payment_business_type AS business_type",
          "citizen_status AS status",
        ])
        .getRawOne();

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
