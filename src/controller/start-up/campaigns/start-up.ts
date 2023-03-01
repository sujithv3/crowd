// created by : vijay
// purpose : start up campaign start up module create update and list

import { AppDataSource } from "../../../data-source";
import { NextFunction, Request, Response } from "express";
import { Campaigns } from "../../../entity/campaigns";
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
        currency,
      } = req.body;

      // get user id

      const user = Jwt.decode(req.cookies.token);
      delete user.role;

      // find campaign start up

      const campaigns = await this.startUpRepository.findOne({
        where: {
          is_active: true,
          is_published: false,
          user: user[0].id,
        },
      });

      if (campaigns || id) {
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
          location: "",
          tax: 0,
          project_image: "",
          project_video: "",
          demo_url: "",
          description: "",
          challenges: "",
          faq: "",
          user: user[0].id,
          manager: null,
          files: [],
          fund: null,
          goal_amount: 0,
          min_invest: 0,
          max_invest: 0,
          deal_size: "",
          raised_fund: 0,
          start_date: null,
          end_date: null,
          is_featured: false,
          status: null,
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
      const user = Jwt.decode(req.cookies.token);
      //   find startUp
      const startCampaigns = await this.startUpRepository.findOne({
        select: ["id", "currency", "business_type"],
        where: {
          is_published: false,
          user: user[0].id,
        },
        relations: {
          tax_location: true,
          bank_location: true,
          category: true,
          subcategory: true,
        },
      });
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
