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

      return responseMessage.responseWithData(true, 200, msg.listDashboard, {
        campaignCount,
        startUpCounts,
        investorCount,
      });
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
