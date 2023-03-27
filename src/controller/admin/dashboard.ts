// created by : Muthukumar
// purpose : Campaign list view for carousel view for dashboard & investor

import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { Users } from "../../entity/Users";
import { Campaigns } from "../../entity/campaigns";
const responseMessage = require("../../configs/response");
const msg = require("../../configs/message");
const Jwt = require("../../utils/jsonwebtoken");

export class DashBoard {
  private campaignRepository = AppDataSource.getRepository(Campaigns);
  private userRepository = AppDataSource.getRepository(Users);

  async getDashboardData(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
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

      const campaignCount = await this.campaignRepository
        .createQueryBuilder()
        .where("is_active=true && is_deleted=false")
        .getCount();

      const startUpCounts = await this.userRepository
        .createQueryBuilder()
        .where("is_active=true AND role_id=1")
        .getCount();

      const investorCount = await this.userRepository
        .createQueryBuilder()
        .where("is_active=true AND role_id=2")
        .getCount();

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        {
          campaignCount,
          startUpCounts,
          investorCount,
        }
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
        .where(
          `campaign.id = :id 
       `,
          {
            id: id,
          }
        )
        .leftJoinAndSelect("campaign.tax_location", "tax_location")
        .leftJoinAndSelect("campaign.category", "category")
        .leftJoinAndSelect("campaign.subcategory", "subcategory")
        .leftJoinAndSelect("campaign.location", "location")
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
