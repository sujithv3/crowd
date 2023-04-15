import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { Campaigns, CAMPAIGN_STATUS } from "../../entity/campaigns";
const responseMessage = require("../../configs/response");
const msg = require("../../configs/message");
const Jwt = require("../../utils/jsonwebtoken");
export class CampaignController {
  private campaignRepository = AppDataSource.getRepository(Campaigns);

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

      console.log(user[0].id);

      const campaignQueryBuilder = this.campaignRepository
        .createQueryBuilder("campaign")
        .where(
          `
         campaign.is_published=:published
         AND campaign.is_deleted=:is_deleted`,
          {
            published: true,
            is_deleted: false,
            is_active: true,
          }
        );

      if (request.query.status) {
        campaignQueryBuilder.andWhere("campaign.status=:status", {
          status: request.query.status,
        });
      }
      if (request.query.from_date && request.query.to_date) {
        const formatDate = (date) => {
          let convertedDate = new Date(date);
          // .toISOString();
          // .replace(/T/, " ") // replace T with a space
          // .replace(/\..+/, "");
          return convertedDate;
        };

        campaignQueryBuilder.andWhere("campaign.start_date > :start_dates  ", {
          start_dates: formatDate(request.query.from_date),
        });
        campaignQueryBuilder.andWhere("campaign.start_date < :end_date ", {
          end_date: formatDate(request.query.to_date),
        });
      }

      const data = await campaignQueryBuilder

        .leftJoinAndSelect("campaign.tax_location", "tax_location")
        .leftJoinAndSelect("campaign.bank_location", "bank_location")
        .leftJoinAndSelect("campaign.location", "location")
        .leftJoinAndSelect("campaign.category", "Category")
        .leftJoinAndSelect("campaign.subcategory", "subcategory")
        .leftJoin("campaign.fund", "fund")
        .orderBy("campaign.id", "DESC")
        .addSelect("SUM(fund.fund_amount)", "received_funds")
        .groupBy("campaign.id")
        .offset(
          request.query.page
            ? Number(request.query.page) *
            (request.query.limit ? Number(request.query.limit) : 10)
            : 0
        )
        .limit(request.query.limit ? Number(request.query.limit) : 10)
        .getRawMany();

      const total_countRepository = await this.campaignRepository
        .createQueryBuilder("campaign")
        .where(
          `
       campaign.is_published=:published
       AND campaign.is_deleted=:is_deleted
       AND campaign.is_active=:is_active`,
          {
            published: true,
            is_deleted: false,
            is_active: true,
          }
        );
      if (request.query.status) {
        total_countRepository.andWhere("campaign.status=:status", {
          status: request.query.status,
        });
      }
      if (request.query.from_date && request.query.to_date) {
        const formatDate = (date) => {
          let convertedDate = new Date(date);
          // .toISOString();
          // .replace(/T/, " ") // replace T with a space
          // .replace(/\..+/, "");
          return convertedDate;
        };

        total_countRepository.andWhere("campaign.start_date > :start_dates  ", {
          start_dates: formatDate(request.query.from_date),
        });
        total_countRepository.andWhere("campaign.start_date < :end_date ", {
          end_date: formatDate(request.query.to_date),
        });
      }
      const total_count = await total_countRepository.getCount();

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        { total_count, data }
      );
    } catch (err) {
      console.log("err", err);
      return responseMessage.responseWithData(
        false,
        400,
        msg.campaignListFailed,
        err
      );
    }
  }

  // list approve campaign
  async approve(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);
    try {
      const campaign = await this.campaignRepository
        .createQueryBuilder()
        .where("id=:id", { id })
        .getOne();

      if (!campaign) {
        return responseMessage.responseWithData(
          false,
          400,
          "campaign not found",
          campaign
        );
      }

      await this.campaignRepository
        .createQueryBuilder()
        .update(Campaigns)
        .set({ status: CAMPAIGN_STATUS.Approved })
        .where("id=:id", { id })
        .execute();

      return responseMessage.responseMessage(true, 200, msg.approved_success);
    } catch (error) {
      console.log(error);
      return responseMessage.responseWithData(
        false,
        400,
        msg.approved_failed,
        error
      );
    }
  }
}
