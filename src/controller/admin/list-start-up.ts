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

      const startUpListRepository = await this.userRepository
        .createQueryBuilder("startUp")
        .where("startUp.is_active=true AND startUp.role_id=1")
        .leftJoinAndSelect("startUp.campaign", "campaign")
        .loadRelationCountAndMap("campaign.fund_count", "campaign.fund")
        .loadRelationCountAndMap("startUp.campaign_count", "startUp.campaign")
        .leftJoinAndSelect("startUp.tagged", "tagged", "tagged.is_active=true")
        .leftJoinAndSelect("tagged.RelationManager", "RelationManager");

      if (request.query.status) {
        startUpListRepository.andWhere(
          `tagged.id IS ${
            request.query.status === "tagged" ? "NOT NULL" : "NULL"
          }`
        );
      }

      const startUpList = await startUpListRepository

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
        .getManyAndCount();

      return responseMessage.responseWithData(true, 200, msg.listStartUp, {
        total_count: startUpList[1],
        data: startUpList[0],
      });
    } catch (err) {
      console.log(err);

      return responseMessage.responseWithData(
        false,
        400,
        msg.listStartUpFailed,
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
        .where("user.is_active=true AND user.id=:id", { id: request.params.id })
        .leftJoinAndSelect("user.campaign", "campaign")
        .leftJoinAndSelect("user.tagged", "tagged")
        .orderBy("tagged.updatedDate", "DESC")
        .leftJoinAndSelect("tagged.RelationManager", "RelationManager")
        .getOne();

      return responseMessage.responseWithData(
        true,
        200,
        msg.listStartUp,
        startUpList
      );
    } catch (error) {
      console.log(error);

      return responseMessage.responseWithData(
        false,
        400,
        msg.listStartUpFailed,
        error
      );
    }
  }

  // assign start up
  async assignedStartUp(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const startUpQueryBuilder = this.userRepository
        .createQueryBuilder("user")
        .where("user.is_active=true AND user.role_id=1");

      if (request.query.country) {
        startUpQueryBuilder.andWhere("user.country=:country", {
          country: request.query.country,
        });
      }
      if (request.query.sector) {
        startUpQueryBuilder.andWhere("user.sector  LIKE :sector", {
          sector: `%${request.query.sector}%`,
        });
      }

      const startUpList = await startUpQueryBuilder
        .leftJoinAndSelect("user.tagged", "tagged", "tagged.is_active=true")
        .leftJoinAndSelect("tagged.RelationManager", "RelationManager")
        .leftJoinAndSelect("user.campaign", "campaign")
        .loadRelationCountAndMap("user.investor_count", "campaign.fund")
        .loadRelationCountAndMap("user.total_campaigns", "user.campaign")
        .andWhere("tagged.id IS NOT NULL")
        .select([
          "user.id",
          "user.first_name",
          "user.last_name",
          "user.sector",
          "user.country",
          "RelationManager.id",
          "RelationManager.first_name",
          "RelationManager.last_name",
          "tagged.id",
          "campaign.id",
        ])
        .skip(
          request.query.page
            ? Number(request.query.page) *
                (request.query.limit ? Number(request.query.limit) : 10)
            : 0
        )
        .take(request.query.limit ? Number(request.query.limit) : 10)
        .getManyAndCount();

      return responseMessage.responseWithData(true, 200, msg.listStartUp, {
        total_count: startUpList[1],
        data: startUpList[0],
      });
    } catch (error) {
      console.log(error);

      return responseMessage.responseWithData(
        false,
        400,
        msg.listStartUpFailed,
        error
      );
    }
  }

  // unassign start up
  async unAssignedStartUp(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const startUpQueryBuilder = this.userRepository
        .createQueryBuilder("user")
        .where("user.is_active=true AND user.role_id=1");

      if (request.query.country) {
        startUpQueryBuilder.andWhere("user.country=:country", {
          country: request.query.country,
        });
      }

      if (request.query.sector) {
        startUpQueryBuilder.andWhere("user.sector  LIKE :sector", {
          sector: `%${request.query.sector}%`,
        });
      }

      const startUpList = await startUpQueryBuilder
        .leftJoinAndSelect("user.tagged", "tagged", "tagged.is_active=true")
        .leftJoinAndSelect("tagged.RelationManager", "RelationManager")
        .leftJoinAndSelect("user.campaign", "campaign")
        .loadRelationCountAndMap("user.investor_count", "campaign.fund")
        .loadRelationCountAndMap("user.total_campaigns", "user.campaign")
        .andWhere("tagged.id IS NULL")
        .select([
          "user.id",
          "user.first_name",
          "user.last_name",
          "user.sector",
          "user.country",
          "RelationManager.id",
          "RelationManager.first_name",
          "RelationManager.last_name",
          "campaign.id",
        ])
        .skip(
          request.query.page
            ? Number(request.query.page) *
                (request.query.limit ? Number(request.query.limit) : 10)
            : 0
        )
        .take(request.query.limit ? Number(request.query.limit) : 10)
        .getManyAndCount();

      return responseMessage.responseWithData(true, 200, msg.listStartUp, {
        total_count: startUpList[1],
        data: startUpList[0],
      });
    } catch (error) {
      console.log(error);

      return responseMessage.responseWithData(
        false,
        400,
        msg.listStartUpFailed,
        error
      );
    }
  }
}
