// created by : Muthukumar
// purpose : Campaign list for carousel view

import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Campaigns } from "../entity/campaigns";
const responseMessage = require("../configs/response");
const msg = require("../configs/message");

export class CampaignController {
  private campaignRepository = AppDataSource.getRepository(Campaigns);

  // list all
  async get(request: Request, response: Response, next: NextFunction) {
    try {
      const data = await this.campaignRepository
        .createQueryBuilder("campaign")
        .where(
          `campaign.is_published=:published
         AND campaign.is_deleted=:is_deleted
         AND campaign.is_active=:is_active
         AND campaign.is_featured=1

         `,
          {
            published: true,
            is_deleted: false,
            is_active: true,
          }
        )
        .skip(0)
        .take(20)
        .leftJoinAndSelect("campaign.tax_location", "tax_location")
        .leftJoinAndSelect("campaign.category", "Category")
        .getMany();

      //   check category exist
      if (data.length === 0) {
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

  async featuredDeals(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      // find user
      const data = await this.campaignRepository
        .createQueryBuilder("campaign")
        .where(
          `campaign.is_published=:published
         AND campaign.is_deleted=:is_deleted
         AND campaign.is_active=:is_active
         AND campaign.is_featured=1

         `,
          {
            published: true,
            is_deleted: false,
            is_active: true,
          }
        )
        .skip(0)
        .take(20)
        .leftJoinAndSelect("campaign.tax_location", "tax_location")
        .leftJoinAndSelect("campaign.category", "Category")
        .getMany();

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        { data }
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.campaignListFailed,
        err
      );
    }
  }

  async raisingDeals(request: Request, response: Response, next: NextFunction) {
    try {
      // find user
      const data = await this.campaignRepository
        .createQueryBuilder("campaign")
        .where(
          `campaign.is_published=:published
         AND campaign.is_deleted=:is_deleted
         AND campaign.is_active=:is_active`,
          {
            published: true,
            is_deleted: false,
            is_active: true,
          }
        )
        .skip(0)
        .take(20)
        .leftJoinAndSelect("campaign.tax_location", "tax_location")
        .leftJoinAndSelect("campaign.category", "Category")
        .getMany();

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        { data }
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.campaignListFailed,
        err
      );
    }
  }

  async closingSoon(request: Request, response: Response, next: NextFunction) {
    try {
      // find user
      const data = await this.campaignRepository
        .createQueryBuilder("campaign")
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
        .leftJoinAndSelect("campaign.tax_location", "tax_location")
        .leftJoinAndSelect("campaign.category", "Category")
        .getMany();

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        { data }
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.campaignListFailed,
        err
      );
    }
  }

  async fundedDeals(request: Request, response: Response, next: NextFunction) {
    try {
      // find user
      const data = await this.campaignRepository
        .createQueryBuilder("campaign")
        .where(
          `campaign.is_published=:published
         AND campaign.is_deleted=:is_deleted
         AND campaign.is_active=:is_active
         AND raised_fund >= goal_amount
         `,
          {
            published: true,
            is_deleted: false,
            is_active: true,
          }
        )
        .skip(0)
        .take(20)
        .leftJoinAndSelect("campaign.tax_location", "tax_location")
        .leftJoinAndSelect("campaign.category", "Category")
        .getMany();

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        { data }
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.campaignListFailed,
        err
      );
    }
  }
}
