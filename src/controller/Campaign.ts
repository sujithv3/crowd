// created by : Muthukumar
// purpose : Campaign list view for carousel view for dashboard & investor

import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Campaigns } from "../entity/campaigns";
const responseMessage = require("../configs/response");
const msg = require("../configs/message");
const Jwt = require("./../utils/jsonwebtoken");

export class CampaignController {
  private campaignRepository = AppDataSource.getRepository(Campaigns);

  async getUserBased(request: Request, response: Response, next: NextFunction) {
    try {
      let token: any;
      if (
        typeof request.cookies.token === "undefined" ||
        request.cookies.token === null
      ) {
        if (!request.headers.authorization) {
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
          token = request.headers.authorization.slice(7);
        }
      } else {
        token = request.cookies.token;
      }

      const user = Jwt.decode(token);

      // featured
      // AND campaign.is_featured=1

      const featured = await this.campaignRepository
        .createQueryBuilder("campaign")
        .addSelect("DATEDIFF(campaign.end_date, NOW())", "daysLeft")
        .where(
          `campaign.user = :id
         AND campaign.is_published=:published
         AND campaign.is_deleted=:is_deleted
         AND campaign.is_active=:is_active
         
         `,
          {
            id: user[0].id,
            published: true,
            is_deleted: false,
            is_active: true,
          }
        )
        .skip(0)
        .take(20)
        .leftJoin("campaign.category", "category")
        .leftJoin("campaign.subcategory", "subcategory")
        .leftJoin("campaign.location", "location")
        .getRawMany();

      const raising = await this.campaignRepository
        .createQueryBuilder("campaign")
        .addSelect("DATEDIFF(campaign.end_date, NOW())", "daysLeft")
        .where(
          `campaign.user = :id
         AND campaign.is_published=:published
         AND campaign.is_deleted=:is_deleted
         AND campaign.is_active=:is_active
         
         `,
          {
            id: user[0].id,
            published: true,
            is_deleted: false,
            is_active: true,
          }
        )
        .skip(0)
        .take(20)
        .leftJoinAndSelect("campaign.category", "category")
        .leftJoinAndSelect("campaign.subcategory", "subcategory")
        .leftJoinAndSelect("campaign.location", "location")
        .getRawMany();

      const closingsoon = await this.campaignRepository
        .createQueryBuilder("campaign")
        .addSelect("DATEDIFF(campaign.end_date, NOW())", "daysLeft")
        .where(
          `campaign.user = :id
         AND campaign.is_published=:published
         AND campaign.is_deleted=:is_deleted
         AND campaign.is_active=:is_active
         
         `,
          {
            id: user[0].id,
            published: true,
            is_deleted: false,
            is_active: true,
          }
        )
        .skip(0)
        .take(20)
        .leftJoinAndSelect("campaign.category", "category")
        .leftJoinAndSelect("campaign.location", "location")
        .leftJoinAndSelect("campaign.subcategory", "subcategory")
        .getRawMany();

      const funded = await this.campaignRepository
        .createQueryBuilder("campaign")
        .addSelect("DATEDIFF(campaign.end_date, NOW())", "daysLeft")
        .where(
          `campaign.user = :id
         AND campaign.is_published=:published
         AND campaign.is_deleted=:is_deleted
         AND campaign.is_active=:is_active
         
         `,
          {
            id: user[0].id,
            published: true,
            is_deleted: false,
            is_active: true,
          }
        )
        .skip(0)
        .take(20)
        .leftJoinAndSelect("campaign.category", "category")
        .leftJoinAndSelect("campaign.location", "location")
        .leftJoinAndSelect("campaign.subcategory", "subcategory")
        .getRawMany();

      const data = {
        featured: featured,
        raising: raising,
        closingsoon: closingsoon,
        funded: funded,
      };

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        data
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

  // list all
  async get(request: Request, response: Response, next: NextFunction) {
    try {
      // featured
      // AND campaign.is_featured=1

      const featured = await this.campaignRepository
        .createQueryBuilder("campaign")
        .addSelect("DATEDIFF(campaign.end_date, NOW())", "daysLeft")
        .where(
          `campaign.is_published=:published
         AND campaign.is_deleted=:is_deleted
         AND campaign.is_active=:is_active
         
         `,
          {
            published: true,
            is_deleted: false,
            is_active: true,
          }
        )
        .skip(0)
        .take(20)
        .leftJoinAndSelect("campaign.category", "category")
        .leftJoinAndSelect("campaign.subcategory", "subcategory")
        .leftJoinAndSelect("campaign.location", "location")
        .getRawMany();

      const raising = await this.campaignRepository
        .createQueryBuilder("campaign")
        .addSelect("DATEDIFF(campaign.end_date, NOW())", "daysLeft")
        .where(
          `campaign.is_published=:published
         AND campaign.is_deleted=:is_deleted
         AND campaign.is_active=:is_active
         
         `,
          {
            published: true,
            is_deleted: false,
            is_active: true,
          }
        )
        .skip(0)
        .take(20)
        .leftJoinAndSelect("campaign.category", "category")
        .leftJoinAndSelect("campaign.subcategory", "subcategory")
        .leftJoinAndSelect("campaign.location", "location")
        .getRawMany();

      const closingsoon = await this.campaignRepository
        .createQueryBuilder("campaign")
        .addSelect("DATEDIFF(campaign.end_date, NOW())", "daysLeft")
        .where(
          `campaign.is_published=:published
         AND campaign.is_deleted=:is_deleted
         AND campaign.is_active=:is_active
         
         `,
          {
            published: true,
            is_deleted: false,
            is_active: true,
          }
        )
        .skip(0)
        .take(20)
        .leftJoinAndSelect("campaign.category", "category")
        .leftJoinAndSelect("campaign.subcategory", "subcategory")
        .leftJoinAndSelect("campaign.location", "location")
        .getRawMany();

      const funded = await this.campaignRepository
        .createQueryBuilder("campaign")
        .addSelect("DATEDIFF(campaign.end_date, NOW())", "daysLeft")
        .where(
          `campaign.is_published=:published
         AND campaign.is_deleted=:is_deleted
         AND campaign.is_active=:is_active
         
         `,
          {
            published: true,
            is_deleted: false,
            is_active: true,
          }
        )
        .skip(0)
        .take(20)
        .leftJoinAndSelect("campaign.category", "category")
        .leftJoinAndSelect("campaign.subcategory", "subcategory")
        .leftJoinAndSelect("campaign.location", "location")
        .getRawMany();

      const data = {
        featured: featured,
        raising: raising,
        closingsoon: closingsoon,
        funded: funded,
      };

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        data
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
  // recent campaign from home page
  async recent(request: Request, response: Response, next: NextFunction) {
    try {
      const data = await this.campaignRepository
        .createQueryBuilder("campaign")
        .addSelect("DATEDIFF(campaign.end_date, NOW())", "daysLeft")
        .where(
          `campaign.is_published=1
         AND campaign.is_deleted=0
         AND campaign.is_active=1
         `
        )
        .skip(0)
        .take(20)
        .leftJoinAndSelect("campaign.category", "category")
        .leftJoinAndSelect("campaign.subcategory", "subcategory")
        .leftJoinAndSelect("campaign.location", "location")
        .getRawMany();

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        data
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
  // campaign detail view
  async getOne(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);
    try {
      const campaign = await this.campaignRepository
        .createQueryBuilder("campaign")
        .select([
          "campaign.id",
          "campaign.title",
          "campaign.tag_line",
          "campaign.tag",
          "campaign.currency",
          "campaign.tax",
          "campaign.project_image",
          "campaign.project_video",
          "campaign.demo_url",
          "campaign.description",
          "campaign.challenges",
          "campaign.files",
          "campaign.business_type",
          "campaign.goal_amount",
          "campaign.min_invest",
          "campaign.max_invest",
          "campaign.deal_size",
          "campaign.fund_document",
          "campaign.duration",
          "campaign.contact_number",
          "campaign.raised_fund",
          "campaign.start_date",
          "campaign.end_date",
          "campaign.is_featured",
          "campaign.contact_email_id",
          "campaign.status",
          "campaign.createdDate",
          "campaign.updatedDate",
          "campaign.is_active",
          "campaign.is_deleted",
          "campaign.is_published",
          "campaign.tax_location_id",
          "campaign.bank_location_id",
          "campaign.user_id",
          "campaign.manager_id",
          "campaign.primary_category",
          "campaign.primary_sub_category",
          "campaign.category_id",
          "campaign.sub_category_id",
          "campaign.staging_id",
          "campaign.raised_fund_date",
          "campaign.faq",
          "campaign.project_location_id ",
          "location.name",
          "location.country",
          "category.name",
          "subcategory.name",
          "users.first_name",
          "users.last_name",
          "users.company_logo",
        ])
        .where(
          `campaign.id = :id 
       `,
          {
            id: id,
          }
        )
        .leftJoin("campaign.category", "category")
        .leftJoin("campaign.subcategory", "subcategory")
        .leftJoin("campaign.location", "location")
        .leftJoin("campaign.user", "users")
        .getOne();

      if (!campaign) {
        return responseMessage.responseWithData(
          false,
          400,
          "campaign not found",
          campaign
        );
      }

      return responseMessage.responseWithData(
        true,
        200,
        msg.userListSuccess,
        campaign
      );
    } catch (error) {
      console.log(error);
      return responseMessage.responseWithData(
        false,
        400,
        msg.userListFailed,
        error
      );
    }
  }
}
