import { AppDataSource } from "../../../data-source";
import { NextFunction, Request, Response } from "express";
import { Campaigns } from "../../../entity/campaigns";
import { Funds } from "../../../entity/funds";
const responseMessage = require("../../../configs/response");
const msg = require("../../../configs/message");
const Jwt = require("../../../utils/jsonwebtoken");
import { Teams } from "../../../entity/teams";
import { BankInfo } from "../../../entity/bankinfo";
export class CampaignController {
  private campaignRepository = AppDataSource.getRepository(Campaigns);
  private fundsRepository = AppDataSource.getRepository(Funds);
  private teamRepository = AppDataSource.getRepository(Teams);
  private bankRepository = AppDataSource.getRepository(BankInfo);
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

      const dataQuery = this.campaignRepository
        .createQueryBuilder("campaign")
        .where(
          `campaign.user = :id AND
         campaign.is_published=:published
         AND campaign.is_deleted=:is_deleted`,
          {
            id: user[0].id,
            published: true,
            is_deleted: false,
            is_active: true,
          }
        )
        .addSelect(
          "(SELECT SUM(funds.fund_amount) FROM funds WHERE funds.campaignId=campaign.id)",
          "fund_amount"
        )
        .leftJoinAndSelect("campaign.bank_location", "bank_location")
        .leftJoinAndSelect("campaign.location", "location")
        .leftJoinAndSelect("campaign.category", "Category")
        .leftJoinAndSelect("campaign.subcategory", "subcategory");

      if (request.query.search) {
        dataQuery.andWhere(
          "(campaign.title LIKE :q OR Category.name LIKE :q)",
          {
            q: "%" + request.query.search + "%",
          }
        );
      }

      const total_count = await dataQuery.getCount();

      dataQuery
        .offset(
          request.query.page
            ? Number(request.query.page) *
            (request.query.limit ? Number(request.query.limit) : 10)
            : 0
        )
        .limit(request.query.limit ? Number(request.query.limit) : 10);

      const data = await dataQuery.getRawMany();

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

  async getInvestors(request: Request, response: Response, next: NextFunction) {
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
      const id = request.params.id;
      console.log(user[0].id);
      // check if campaign exists for given user id
      const campaignExists = await this.campaignRepository
        .createQueryBuilder("campaign")
        .select([
          'campaign.id',
          'campaign.title',
          'campaign.goal_amount',
        ])
        .where('id=:id AND user_id=:userId', {
          id: id,
          userId: user[0].id,
        }).getOne();

      if (!campaignExists) {
        return responseMessage.responseWithData(
          false,
          400,
          msg.campaignListFailed,
        );
      }

      const sumAMount = await this.fundsRepository
        .createQueryBuilder("fund")
        .select(['SUM(fund.fund_amount) as total'])
        .leftJoin("fund.investor", "investor")
        .where('fund.campaignId=:id', {
          id: campaignExists.id
        }).groupBy('fund.campaignId').getRawOne();


      const dataQuery = this.fundsRepository
        .createQueryBuilder("fund")
        .addSelect([
          'investor.first_name',
          'investor.last_name',
          'investor.profile',
          'investor.country',
        ])
        .leftJoin("fund.investor", "investor")
        .where('fund.campaignId=:id', {
          id: campaignExists.id
        })

      if (request.query.search) {
        dataQuery.andWhere(
          "(investor.first_name LIKE :q OR investor.last_name LIKE :q)",
          {
            q: "%" + request.query.search + "%",
          }
        );
      }

      const total_count = await dataQuery.getCount();

      dataQuery
        .offset(
          request.query.page
            ? Number(request.query.page) *
            (request.query.limit ? Number(request.query.limit) : 10)
            : 0
        )
        .limit(request.query.limit ? Number(request.query.limit) : 10);

      const data = await dataQuery.getRawMany();

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        { campaign: campaignExists, total_count, total_fund: sumAMount?.total || 0, data }
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

  async getCompleteStatus(req: Request, res: Response, next: NextFunction) {
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
      const startCampaigns = await this.campaignRepository
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
        .getOne();

      console.log('startCampaigns', startCampaigns);
      let start_campaign = false;
      let basic_info = false;
      let project_detail = false;
      let team = false;
      let funding = false;
      let payment = false;
      let bank = false;
      if (startCampaigns?.category?.id && startCampaigns?.subcategory?.id) {
        start_campaign = true;
      }

      if (startCampaigns?.title && startCampaigns?.tag_line && startCampaigns?.project_image) {
        basic_info = true;
      }

      if (startCampaigns?.description && startCampaigns?.challenges) {
        project_detail = true;
      }

      const teams = await this.teamRepository
        .createQueryBuilder("team")
        .where("team.campaign = :id", { id: startCampaigns.id })
        .getMany();

      console.log('teams', teams);

      if (teams && teams.length > 0) {
        team = true;
      }

      if (startCampaigns?.contact_email_id && startCampaigns?.citizen_status) {
        payment = true;
      }

      const bank_data = await this.bankRepository
        .createQueryBuilder("bank")
        .where("bank.campaign = :id", { id: startCampaigns.id })
        .getOne();

      if (bank_data) {
        bank = true;
      }

      const completed: any = {
        start_campaign,
        basic_info,
        project_detail,
        team,
        funding,
        payment,
        bank
      };


      return responseMessage.responseWithData(
        true,
        200,
        msg.startCampaignListSuccess,
        completed
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

  // list one campaign
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
        .leftJoinAndSelect("campaign.bank_location", "bank_location")
        .leftJoinAndSelect("campaign.location", "location")
        .leftJoinAndSelect("campaign.primary_category", "primary_category")
        .leftJoinAndSelect(
          "campaign.primary_sub_category",
          "primary_sub_category"
        )
        .leftJoinAndSelect("campaign.category", "category")
        .leftJoinAndSelect("campaign.subcategory", "subcategory")
        .leftJoinAndSelect("campaign.team", "Teams")
        .leftJoinAndSelect("campaign.bank", "BankInfo")
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

  async delete(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);
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

    console.log("userId", user[0].id);

    try {
      const campaign = await this.campaignRepository
        .createQueryBuilder("campaign")
        .where(
          `campaign.id = :id AND
          campaign.user_id = :userid AND
          campaign.is_deleted = 0
       `,
          {
            id: id,
            userid: user[0].id,
          }
        )
        .getOne();

      console.log("campaign", campaign);

      if (!campaign) {
        return responseMessage.responseWithData(
          false,
          400,
          "campaign not found",
          campaign
        );
      } else {
        await this.campaignRepository
          .createQueryBuilder("campaign")
          .update(Campaigns)
          .set({
            is_deleted: true,
          })
          .where(
            `id = :id 
       `,
            {
              id: campaign.id,
            }
          )
          .execute();
      }

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignDeleteSuccess
      );
    } catch (error) {
      console.log(error);
      return responseMessage.responseWithData(
        false,
        400,
        msg.campaignDeleteFailed,
        error
      );
    }
  }
}
