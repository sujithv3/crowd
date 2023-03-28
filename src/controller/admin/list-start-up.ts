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

  // list start up
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

      const startUpList = await this.userRepository
        .createQueryBuilder("startUp")
        .where("startUp.is_active=true AND startUp.role_id=1")

        .leftJoinAndSelect("startUp.campaign", "campaign")
        .loadRelationCountAndMap("campaign.fund_count", "campaign.fund")
        .loadRelationCountAndMap("startUp.campaign_count", "startUp.campaign")
        .leftJoinAndSelect("startUp.tagged", "tagged", "tagged.is_active=true")
        .leftJoinAndSelect("tagged.RelationManager", "RelationManager")
        .select([
          "startUp.id",
          "startUp.first_name",
          "startUp.last_name",
          "startUp.country",
          "startUp.city",
          "campaign.id",
          "tagged",
          "RelationManager",
        ])

        .skip(
          request.query.page
            ? Number(request.query.page) *
                (request.query.limit ? Number(request.query.limit) : 10)
            : 0
        )
        .take(request.query.limit ? Number(request.query.limit) : 10)
        .getMany();

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        startUpList
      );
    } catch (err) {
      console.log(err);

      return responseMessage.responseWithData(
        false,
        400,
        msg.categoryListFailed,
        err
      );
    }
  }

  // get start up list

  async getStartUpUser(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const startUpList = await this.userRepository
        .createQueryBuilder("user")
        .where("user.is_active=true AND id=:id", { id: request.params.id })
        .leftJoinAndSelect("startUp.campaign", "campaign")
        .leftJoinAndSelect("startUp.tagged", "tagged")
        .leftJoinAndSelect("tagged.RelationManager", "RelationManager")
        .orderBy("RelationManager.updatedDate", "DESC")
        .getOne();

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        startUpList
      );
    } catch (error) {
      console.log(error);

      return responseMessage.responseWithData(
        false,
        400,
        msg.categoryListFailed,
        error
      );
    }
  }
}
