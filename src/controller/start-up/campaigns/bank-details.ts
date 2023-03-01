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

      const user = Jwt.decode(req.cookies.token);
      delete user.role;

      // find campaign

      const campaign = await this.campaignRepository.findOne({
        where: {
          is_active: true,
          is_published: false,
          user: user[0].id,
        },
      });

      if (!campaign) {
        return responseMessage.responseMessage(
          false,
          400,
          msg.banksCampaignNotFound
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
        .where("user=:id", { id: user[0].id })
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
      const user = Jwt.decode(req.cookies.token);
      delete user.role;

      // find campaign

      const campaign = await this.campaignRepository.findOne({
        where: {
          is_active: true,
          is_published: false,
          user: user[0].id,
        },
      });

      //   find bank
      const basicCampaigns = await this.bankRepository
        .createQueryBuilder("bank")
        .leftJoinAndSelect("bank.bank_location", "Location")
        .where("bank.campaign = :id", { id: campaign.id })
        .getOne();

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
