// created by : Muthukumar
// purpose : Campaign list view for carousel view for dashboard & investor

import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { rmAdmin } from "../../entity/rmAdmin";
import { Campaigns } from "../../entity/campaigns";
const responseMessage = require("../../configs/response");
const msg = require("../../configs/message");
const Jwt = require("../../utils/jsonwebtoken");

export class RelationManager {
  private campaignRepository = AppDataSource.getRepository(Campaigns);
  private userRepository = AppDataSource.getRepository(rmAdmin);

  async getRmList(request: Request, response: Response, next: NextFunction) {
    try {
      // featured
      // AND campaign.is_featured=1

      const startUpCounts = await this.userRepository
        .createQueryBuilder("user")
        .where("user.is_active=true AND user.role_id=3")
        .loadRelationCountAndMap("user.tagged", "user.tagged", "tagged", (qb) =>
          qb.andWhere("tagged.is_active=true")
        )
        .getManyAndCount();

      return responseMessage.responseWithData(true, 200, msg.list_success, {
        total_count: startUpCounts[1],
        data: startUpCounts[0],
      });
    } catch (err) {
      return responseMessage.responseWithData(false, 400, msg.list_Failed, err);
    }
  }

  // get one rm details

  async getOneRm(request: Request, response: Response, next: NextFunction) {
    try {
      const id = parseInt(request.params.id);

      const investorList = await this.userRepository
        .createQueryBuilder("user")
        .where("user.is_active=true AND user.role_id=3 AND user.id=:id", {
          id,
        })
        .leftJoinAndSelect("user.tagged", "tagged", "tagged.is_active=true")
        .leftJoinAndSelect("tagged.StartUp", "startUp")
        .loadRelationCountAndMap(
          "user.tagged_count",
          "user.tagged",
          "tagged",
          (qb) => qb.andWhere("tagged.is_active=true")
        )
        .loadRelationCountAndMap(
          "user.campaign_count",
          "startUp.campaign",
          "campaign",
          (qb) => qb.andWhere("campaign.is_active=true")
        )
        .leftJoinAndSelect("startUp.campaign", "campaign")
        .loadRelationCountAndMap(
          "user.investor_count",
          "campaign.fund",
          "fund",
          (qb) => qb.andWhere("fund.is_active=true")
        )
        .getOne();

      return responseMessage.responseWithData(
        true,
        200,
        msg.list_success,
        investorList
      );
    } catch (error) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.list_Failed,
        error
      );
    }
  }
}
