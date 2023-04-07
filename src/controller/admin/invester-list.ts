// created by : Muthukumar
// purpose : Campaign list view for carousel view for dashboard & investor

import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { Users } from "../../entity/Users";
import { Funds } from "../../entity/funds";
const responseMessage = require("../../configs/response");
const msg = require("../../configs/message");
const Jwt = require("../../utils/jsonwebtoken");

export class ListInvestor {
  private campaignRepository = AppDataSource.getRepository(Funds);
  private userRepository = AppDataSource.getRepository(Users);

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
        .leftJoinAndSelect("investors.fund", "fund", "fund.is_active=true")
        .loadRelationCountAndMap(
          "investors.total_invest_count",
          "investors.fund"
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
          "investors.city",
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
        e.fund.forEach((a: any) => {
          if (a.campaign) {
            current_invest_count = current_invest_count + 1;
          }
        });
        e.current_invest_count = current_invest_count;
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

  // get investor list

  async getInvestor(request: Request, response: Response, next: NextFunction) {
    try {
      const InvestorData = await this.campaignRepository
        .createQueryBuilder("investors")
        .where("investors.investor=:id", { id: request.params.id })
        .leftJoinAndSelect(
          "investors.campaign",
          "campaign",
          `campaign.end_date >= ${new Date().toISOString().slice(0, 10)}`
        )
        .leftJoinAndSelect("campaign.user", "user")
        .leftJoinAndSelect("user.tagged", "tagged", "tagged.is_active=true")
        .leftJoin("campaign.fund", "fund", "fund.is_active=true")
        .addSelect("fund.fund_amount")
        .leftJoinAndSelect("tagged.RelationManager", "RelationManager")

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
        console.log(e.total_count);

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
