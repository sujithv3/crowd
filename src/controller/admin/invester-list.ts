// created by : Muthukumar
// purpose : Campaign list view for carousel view for dashboard & investor

import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { Users } from "../../entity/Users";
import { Funds } from "../../entity/funds";
import { Campaigns } from "../../entity/campaigns";
import { Between } from "typeorm";
const responseMessage = require("../../configs/response");
const msg = require("../../configs/message");
const Jwt = require("../../utils/jsonwebtoken");

export class ListInvestor {
  private campaignRepository = AppDataSource.getRepository(Funds);
  private userRepository = AppDataSource.getRepository(Users);
  private campaignsRepository = AppDataSource.getRepository(Campaigns);

  // list start up
  async getInvestorList(
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

      const investorListRepository = await this.userRepository
        .createQueryBuilder("investors")
        .where("investors.is_active=true AND investors.role_id=2")
        .orderBy("investors.id", "DESC")
        .leftJoinAndSelect("investors.city", 'city')
        .leftJoinAndSelect("investors.fund", "fund", "fund.is_active=true")
        .loadRelationCountAndMap(
          "investors.total_invest_count",
          "investors.fund",
          "fund",
          (qb) => qb.andWhere("fund.is_active=true")
        )
        .leftJoinAndSelect(
          "fund.campaign",
          "campaign",
          `campaign.end_date >= ${new Date().toISOString().slice(0, 10)}`
        );
      if (request.query.country) {
        investorListRepository.andWhere("investors.country=:country", {
          country: request.query.country,
        });
      }
      const investorList = await investorListRepository
        .select([
          "investors.id",
          "investors.first_name",
          "investors.last_name",
          "investors.country",
          "city.name",
          "city.state_code",
          "fund",
          "campaign",
        ])

        .skip(
          request.query.page
            ? Number(request.query.page) *
            (request.query.limit ? Number(request.query.limit) : 10)
            : 0
        )
        .take(request.query.limit ? Number(request.query.limit) : 10)
        .getManyAndCount();

      const data = await investorList[0].map((e: any) => {
        let current_invest_count = 0;
        console.log();
        e.fund.forEach((a: any) => {
          if (a.campaign) {
            current_invest_count = current_invest_count + 1;
          }
        });
        e.current_invest_count = current_invest_count;
        e.city_state = e.city ? `${e.city.name}, ${e.city.state_code}` : null
        delete e.fund;
        return e;
      });

      return responseMessage.responseWithData(true, 200, msg.list_success, {
        total_count: investorList[1],
        data,
      });
    } catch (err) {
      console.log(err);

      return responseMessage.responseWithData(false, 400, msg.list_Failed, err);
    }
  }

  // get invested campaign
  async getInvestedCampaign(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      // const BeforeDate = (date: Date) => Between(subYears(date, 100), date);
      const date: any = new Date();
      const moment: any = require("moment");
      console.log(moment().format("YYYY-MM-DD HH:mm:ss"));

      const InvestorRepository = await this.campaignRepository
        .createQueryBuilder("investors")
        .where("investors.investor=:id AND investors.is_active=true", {
          id: request.params.id,
        })
        .leftJoinAndSelect("investors.campaign", "campaign")
        .andWhere(`campaign.end_date > ${moment().format("YYYY-MM-DD")} `);
      // .andWhere("campaign.id IS NOT NULL");
      const investedCampaign: any = await InvestorRepository.leftJoinAndSelect(
        "campaign.user",
        "user"
      )
        .leftJoinAndSelect("user.tagged", "tagged", "tagged.is_active=true")
        .leftJoin("campaign.fund", "fund", "fund.is_active=true")
        .addSelect("fund.fund_amount")
        .leftJoinAndSelect("tagged.RelationManager", "RelationManager")
        .skip(
          request.query.page
            ? Number(request.query.page) *
            (request.query.limit ? Number(request.query.limit) : 10)
            : 0
        )
        .take(request.query.limit ? Number(request.query.limit) : 10)
        .orderBy("investors.id", "DESC")
        .select([
          "investors.id",
          "campaign",
          "user.id",
          "tagged.id",
          "fund",
          "RelationManager.id",
          "RelationManager.first_name",
          "RelationManager.last_name",
        ])
        .getManyAndCount();

      return responseMessage.responseWithData(true, 200, msg.list_success, {
        total_count: investedCampaign[1],
        data: investedCampaign[0],
      });
    } catch (error) {
      console.log(error);

      return responseMessage.responseWithData(
        false,
        400,
        msg.list_Failed,
        error
      );
    }
  }

  // get investor list

  async getInvestor(request: Request, response: Response, next: NextFunction) {
    try {
      const InvestorData = await this.campaignRepository
        .createQueryBuilder("investors")
        .where("investors.investor=:id AND investors.is_active=true", {
          id: request.params.id,
        })
        .leftJoinAndSelect(
          "investors.campaign",
          "campaign",
          `campaign.end_date > ${new Date().toISOString().slice(0, 10)}`
        )
        .leftJoinAndSelect("campaign.user", "user")
        .leftJoinAndSelect("user.tagged", "tagged", "tagged.is_active=true")
        .leftJoin("campaign.fund", "fund", "fund.is_active=true")
        .addSelect("fund.fund_amount")
        .leftJoinAndSelect("tagged.RelationManager", "RelationManager")
        .skip(
          request.query.page
            ? Number(request.query.page) *
            (request.query.limit ? Number(request.query.limit) : 10)
            : 0
        )
        .take(request.query.limit ? Number(request.query.limit) : 10)
        .getMany();

      const investedDetails = await this.userRepository
        .createQueryBuilder("")
        .where("id=:id", { id: request.params.id })
        .getOne();

      if (investedDetails) {
        delete investedDetails.password;
      }

      let total_funding_amount = 0;
      let on_going_campaign = 0;
      const campaign = [];

      await InvestorData.forEach((e: any) => {
        total_funding_amount = Number(e.fund_amount) + total_funding_amount;

        if (e.campaign) {
          const campaignData = { ...e.campaign };
          let CampaignReceivedAmount = 0;

          campaignData.fund.forEach((e: any) => {
            CampaignReceivedAmount = CampaignReceivedAmount + e.fund_amount;
          });

          campaignData.fun_details = {
            invest_fund: e.fund_amount,
            received_amount: CampaignReceivedAmount,
          };
          campaign.push(campaignData);
          on_going_campaign = on_going_campaign + 1;
        }
      });
      campaign.forEach((element) => {
        console.log(element.end_date);
      });

      const data = {
        investor: investedDetails,
        investedDetails: {
          total_funding_amount,
          on_going_campaign,
          total_fund_campaign: InvestorData.length,
        },
        campaign,
      };

      return responseMessage.responseWithData(
        true,
        200,
        msg.list_success,
        data
      );
    } catch (error) {
      console.log(error);

      return responseMessage.responseWithData(
        false,
        400,
        msg.list_Failed,
        error
      );
    }
  }
}
