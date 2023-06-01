// created by : vijay
// purpose : start up campaign banks module create update and list

import { AppDataSource } from "../../../data-source";
import { NextFunction, Request, Response } from "express";
import { Campaigns } from "../../../entity/campaigns";
import { BankInfo } from "../../../entity/bankinfo";
import { isDataFilled } from "../../../utils/campaignFill";
const responseMessage = require("../../../configs/response");
const msg = require("../../../configs/message");
const Jwt = require("../../../utils/jsonwebtoken");
import { Teams } from "../../../entity/teams";

export class bankController {
  private campaignRepository = AppDataSource.getRepository(Campaigns);
  private bankRepository = AppDataSource.getRepository(BankInfo);
  private teamRepository = AppDataSource.getRepository(Teams);  //   create funds
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
        bank_country,
        bank_address = "",
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

      // const campaigns = await this.campaignRepository
      //   .createQueryBuilder("")
      //   .where("user_id=:id AND is_active=true AND is_published=false", {
      //     id: user[0].id,
      //   })
      //   .getOne();

      // if (!campaigns) {
      //   return responseMessage.responseMessage(
      //     false,
      //     400,
      //     msg.createStartCampaignFirst
      //   );
      // }

      const { campaigns, filled, message } = await isDataFilled('bank', user[0].id, this.campaignRepository, this.teamRepository);
      if (filled === false) {
        return responseMessage.responseMessage(
          false,
          400,
          message
        );
      }

      // all module complete check
      const checked =
        campaigns.title &&
        campaigns.currency &&
        campaigns.description &&
        campaigns.goal_amount;
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
        .where("bank.campaign = :id", { id: campaigns.id })
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
            bank_country,
            campaign: campaigns,
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
          bank_country,
          campaign: campaigns,
          bank_address,
          createdDate: new Date(),
          updatedDate: new Date(),
          is_active,
          is_deleted,
        });
      }
      const updateData: any = {
        is_published: true,
      };
      if (bank_location) {
        updateData.bank_location = bank_location;
      }
      // update campaign
      await this.campaignRepository
        .createQueryBuilder()
        .update(Campaigns)
        .set(updateData)
        .where("id=:id", { id: campaigns.id })
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

      // console.log(user[0].id);

      // find campaign

      const campaign = await this.campaignRepository
        .createQueryBuilder("campaign")
        .leftJoinAndSelect("campaign.bank_location", "bank_location")
        .where(
          "campaign.user_id=:id AND campaign.is_active=true AND campaign.is_published=false",
          {
            id: user[0].id,
          }
        )
        .getOne();

      if (!campaign) {
        return responseMessage.responseWithData(
          true,
          200,
          msg.banksCampaignListSuccess,
          null
        );
      }

      //   find bank
      let bankInfo: any = await this.bankRepository
        .createQueryBuilder("bank")
        .leftJoinAndSelect("bank.bank_location", "Location")
        .leftJoinAndSelect("bank.bank_country", "country")
        .where("bank.campaign = :id", { id: campaign.id })
        .getOne();
      console.log("campaign?.bank_location", campaign?.bank_location);
      if (
        !bankInfo &&
        campaign?.bank_location &&
        campaign?.bank_location?.country
      ) {
        bankInfo = {
          bank: bankInfo,
          bank_location: campaign?.bank_location,
        };
      }

      return responseMessage.responseWithData(
        true,
        200,
        msg.banksCampaignListSuccess,
        bankInfo
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
