// created by : vijay
// purpose : start up campaign start up module create update and list

import { AppDataSource } from "../../../data-source";
import { NextFunction, Request, Response } from "express";
import { Campaigns, CAMPAIGN_STATUS } from "../../../entity/campaigns";
const responseMessage = require("../../../configs/response");
const msg = require("../../../configs/message");
import { Category } from "../../../entity/category";
const Jwt = require("../../../utils/jsonwebtoken");

export class startUpController {
  private startUpRepository = AppDataSource.getRepository(Campaigns);
  private categoryRepository = AppDataSource.getRepository(Category);
  //   create start up
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        id,
        category,
        sub_category,
        business_type,
        tax_location,
        bank_location,
        staging,
        currency,
      } = req.body;

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

      // find campaign start up
      console.log(user[0].id);
      const campaigns = await this.startUpRepository
        .createQueryBuilder()
        .where("user_id=:id AND is_active=true AND is_published=false", {
          id: user[0].id,
        })
        .getOne();
      if (campaigns) {
        await this.startUpRepository
          .createQueryBuilder()
          .update(Campaigns)
          .set({
            id,
            category,
            subcategory: sub_category,
            business_type,
            user: user[0].id,
            tax_location,
            staging,
            bank_location,
            currency,
          })
          .where("id = :id", { id: id ? id : campaigns.id })
          .execute();
        return responseMessage.responseMessage(
          true,
          200,
          msg.startCampaignCreateSuccess
        );
      } else {
        //   create startUp
        await this.startUpRepository.save({
          category,
          subcategory: sub_category,
          business_type,
          tax_location,
          bank_location,
          currency,
          title: "",
          tag_line: "",
          location: null,
          tax: 0,
          project_image: "",
          project_video: "",
          demo_url: "",
          description: "",
          challenges: "",
          faq: null,
          user: user[0].id,
          manager: null,
          files: [],
          fund: null,
          goal_amount: null,
          min_invest: null,
          staging,
          max_invest: null,
          deal_size: "",
          raised_fund: null,
          start_date: null,
          end_date: null,
          is_featured: false,
          status: CAMPAIGN_STATUS.NOT_APPROVE,
          createdDate: new Date(),
          updatedDate: new Date(),
          is_active: true,
          is_deleted: false,
          is_published: false,
        });
        return responseMessage.responseMessage(
          true,
          200,
          msg.startCampaignCreateSuccess
        );
      }
    } catch (err) {
      console.log(err);

      return responseMessage.responseWithData(
        false,
        400,
        msg.startCampaignCreateFailed,
        err
      );
    }
  }

  // list startUp
  async list(req: Request, res: Response, next: NextFunction) {
    try {
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
      //   find startUp
      const startCampaigns = await this.startUpRepository
        .createQueryBuilder("campaign")
        .where(
          "campaign.user_id=:id AND campaign.is_active=true AND campaign.is_published=false",
          {
            id: user[0].id,
          }
        )
        .leftJoinAndSelect("campaign.tax_location", "tax_location")
        .leftJoinAndSelect("campaign.bank_location", "bank_location")
        .leftJoinAndSelect("campaign.category", "category")
        .leftJoinAndSelect("campaign.subcategory", "subcategory")
        .leftJoinAndSelect("campaign.staging", "staging")
        .select([
          "campaign.id",
          "campaign.currency",
          "campaign.business_type",
          "tax_location",
          "bank_location",
          "category",
          "subcategory",
          "staging",
        ])
        .getOne();

      return responseMessage.responseWithData(
        true,
        200,
        msg.startCampaignListSuccess,
        startCampaigns
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.startCampaignListFailed,
        err
      );
    }
  }
}
