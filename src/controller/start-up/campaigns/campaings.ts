import { AppDataSource } from "../../../data-source";
import { NextFunction, Request, Response } from "express";
import { Campaigns } from "../../../entity/campaigns";
const responseMessage = require("../../../configs/response");
const msg = require("../../../configs/message");
const Jwt = require("../../../utils/jsonwebtoken");
export class CampaignController {
  private rolesRepository = AppDataSource.getRepository(Campaigns);

  //   list user bashed campaign
  async all(request: Request, response: Response, next: NextFunction) {
    try {
      // find user
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

      console.log(request.query.limit);

      const userData = await this.rolesRepository
        .createQueryBuilder("campaign")
        .where(
          `campaign.user = :id AND
         campaign.is_published=:published
         AND campaign.is_deleted=:is_deleted
         AND campaign.is_active=:is_active`,
          {
            id: user[0].id,
            published: true,
            is_deleted: false,
            is_active: true,
          }
        )
        .skip(
          request.query.page
            ? Number(request.query.page) *
                (request.query.limit ? Number(request.query.limit) : 10)
            : 0
        )
        .take(request.query.limit ? Number(request.query.limit) : 10)
        .leftJoinAndSelect("campaign.tax_location", "tax_location")
        .leftJoinAndSelect("campaign.bank_location", "bank_location")
        .leftJoinAndSelect("campaign.primary_category", "primary_category")
        .leftJoinAndSelect(
          "campaign.primary_sub_category",
          "primary_sub_category"
        )
        .leftJoinAndSelect("campaign.category", "Category")
        .leftJoinAndSelect("campaign.subcategory", "subcategory")
        .leftJoinAndSelect("campaign.team", "Teams")
        .leftJoinAndSelect("Teams.role", "role")
        .leftJoinAndSelect("campaign.bank", "BankInfo")
        .leftJoinAndSelect("BankInfo.bank_location", "location")
        .getMany();

      const total_count = await this.rolesRepository
        .createQueryBuilder("campaign")
        .where(
          `campaign.user = :id AND
       campaign.is_published=:published
       AND campaign.is_deleted=:is_deleted
       AND campaign.is_active=:is_active`,
          {
            id: user[0].id,
            published: true,
            is_deleted: false,
            is_active: true,
          }
        )
        .getCount();

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        { total_count, userData }
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
