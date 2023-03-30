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
        .where("is_active=true AND role_id=3")
        .loadRelationCountAndMap("user.tagged", "user.tagged", "tagged", (qb) =>
          qb.andWhere("tagged.is_active=true")
        )
        .getManyAndCount();

      return responseMessage.responseWithData(
        true,
        200,
        msg.listDashboard,
        startUpCounts
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.listDashboardFailed,
        err
      );
    }
  }
}