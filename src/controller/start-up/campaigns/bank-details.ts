// created by : vijay
// purpose : start up campaign banks module create update and list

import { AppDataSource } from "../../../data-source";
import { NextFunction, Request, Response } from "express";
import { Campaigns } from "../../../entity/campaigns";
import { BankInfo } from "../../../entity/bankinfo";
const responseMessage = require("../../../configs/response");
const msg = require("../../../configs/message");
const Jwt = require("../../../utils/jsonwebtoken");

export class bankController {
  private campaignRepository = AppDataSource.getRepository(Campaigns);
  private bankRepository = AppDataSource.getRepository(BankInfo);

  //   create project details
  async create(req: any, res: Response, next: NextFunction) {
    try {
      const {
        id,
        transit_number,
        finance_number,
        bank_name,
        account_number,
        swift,
        bank_location,
        bank_address,
        is_active = true,
        is_deleted = false,
      } = req.body;
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

      const campaign = await this.campaignRepository
        .createQueryBuilder("")
        .where("user_id=:id AND is_active=true AND is_published=false", {
          id: user[0].id,
        })
        .getOne();

      if (!campaign) {
        return responseMessage.responseMessage(
          false,
          400,
          msg.createStartCampaignFirst
        );
      }

      // all module complete check
      const checked =
        campaign.title &&
        campaign.currency &&
        campaign.description &&
        campaign.goal_amount;
      if (!checked) {
        return responseMessage.responseMessage(
          false,
          400,
          msg.completeAllStartUpModule
        );
      }

      //   find tames
      const bank = await this.bankRepository
        .createQueryBuilder("bank")
        .where("bank.campaign = :id", { id: campaign.id })
        .getOne();

      if (bank) {
        // update bank table
        await this.bankRepository
          .createQueryBuilder()
          .update(BankInfo)
          .set({
            transit_number,
            bank_name,
            finance_number,
            account_number,
            swift,
            bank_location,
            campaign,
            bank_address,
            updatedDate: new Date(),
            is_active,
            is_deleted,
          })
          .where("id = :id", { id: id ? id : bank.id })
          .execute();
      } else {
        // create bank table
        await this.bankRepository.save({
          transit_number,
          bank_name,
          finance_number,
          account_number,
          swift,
          bank_location,
          campaign,
          bank_address,
          createdDate: new Date(),
          updatedDate: new Date(),
          is_active,
          is_deleted,
        });
      }

      // update campaign
      await this.campaignRepository
        .createQueryBuilder()
        .update(Campaigns)
        .set({
          is_published: true,
          bank_location: bank_location,
        })
        .where("id=:id", { id: campaign.id })
        .execute();

      return responseMessage.responseMessage(
        true,
        200,
        msg.banksCampaignCreateSuccess
      );
    } catch (err) {
      console.log(err);
      return responseMessage.responseWithData(
        false,
        400,
        msg.banksCampaignCreateFailed,
        err
      );
    }
  }

  // list bank table
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      // find user
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

      console.log(user[0].id);

      // find campaign

      const campaign = await this.campaignRepository
        .createQueryBuilder("campaign")
        .leftJoinAndSelect('campaign.bank_location', 'bank_location')
        .where("campaign.user_id=:id AND campaign.is_active=true AND campaign.is_published=false", {
          id: user[0].id,
        })
        .getOne();

      if (!campaign) {
        return responseMessage.responseMessage(false, 404, "No Data Found");
      }

      //   find bank
      let basicCampaigns: any = await this.bankRepository
        .createQueryBuilder("bank")
        .leftJoinAndSelect("bank.bank_location", "Location")
        .where("bank.campaign = :id", { id: campaign.id })
        .getOne();
      console.log('campaign?.bank_location', campaign?.bank_location);
      if (!basicCampaigns && campaign?.bank_location && campaign?.bank_location?.country) {

        basicCampaigns = {
          bank_location: campaign?.bank_location
        }
      }

      return responseMessage.responseWithData(
        true,
        200,
        msg.banksCampaignListSuccess,
        basicCampaigns
      );
    } catch (err) {
      console.log(err);
      return responseMessage.responseWithData(
        false,
        400,
        msg.banksCampaignListFailed,
        err
      );
    }
  }
}
