// created by : Muthukumar
// purpose : Campaign list view for carousel view for dashboard & investor

import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { Users } from "../../entity/Users";
import { Campaigns } from "../../entity/campaigns";
const responseMessage = require("../../configs/response");
const msg = require("../../configs/message");
const Jwt = require("../../utils/jsonwebtoken");

export class ListStartUp {
  private campaignRepository = AppDataSource.getRepository(Campaigns);
  private userRepository = AppDataSource.getRepository(Users);

  async getStartUpList(
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

      const startUpCounts = await this.userRepository
        .createQueryBuilder("startUp")
        .where("startUp.is_active=true AND startUp.role_id=1")
        .leftJoinAndSelect("startUp.campaign", "campaign")
        .loadRelationCountAndMap("campaign.fund_count", "campaign.fund")
        .loadRelationCountAndMap("startUp.campaign_count", "startUp.campaign")
        .leftJoinAndSelect("startUp.tagged", "tagged")
        .select([
          "startUp.id",
          "startUp.first_name",
          "startUp.last_name",
          "startUp.country",
          "startUp.city",
          "startUp.city",
          "campaign.id",
          "tagged",
        ])
        .getMany();

      console.log(startUpCounts);

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        startUpCounts
      );
    } catch (err) {
      // console.log(err);

      return responseMessage.responseWithData(
        false,
        400,
        msg.categoryListFailed,
        err
      );
    }
  }
}
