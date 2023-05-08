// created by : Muthukumar
// purpose : Campaign list view for carousel view for dashboard & investor

import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { Users } from "../../entity/Users";
import { Tagged } from "../../entity/tagged";
import { Campaigns } from "../../entity/campaigns";
const responseMessage = require("../../configs/response");
const msg = require("../../configs/message");
const Jwt = require("../../utils/jsonwebtoken");

export class ListStartUp {
  private campaignRepository = AppDataSource.getRepository(Campaigns);
  private userRepository = AppDataSource.getRepository(Users);
  private taggedRepository = AppDataSource.getRepository(Tagged);

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
        .leftJoinAndSelect("startUp.city", "city")
        .leftJoinAndSelect("startUp.campaign", "campaign")
        .loadRelationCountAndMap(
          "campaign.fund_count",
          "campaign.fund",
          "fund",
          (qb) => qb.andWhere("fund.is_active=true")
        )
        .orderBy("startUp.id", "DESC")
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
          "startUp.company_name",
          "startUp.country",
          "city.name",
          "city.state_code",
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

      const data = await startUpList[0].map((e: any) => {
        e.city_name = e.city ? `${e.city.name}` : null;
        return e;
      });

      return responseMessage.responseWithData(true, 200, msg.listStartUp, {
        total_count: startUpList[1],
        data,
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

  // get user start up campaign
  async getStartUpCampaign(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const campaign = await this.campaignRepository
        .createQueryBuilder("campaign")
        .where(
          "campaign.is_active=true AND campaign.is_deleted=false AND campaign.is_published=true AND campaign.user=:id",
          {
            id: request.params.id,
          }
        )
        .leftJoinAndSelect("campaign.fund", "fund", "fund.is_active=true")
        .leftJoinAndSelect("fund.investor", "investor")
        .select([
          "campaign",
          "fund.id",
          "investor.id",
          "investor.first_name",
          "investor.last_name",
          "investor.company_name",
          "investor.country",
        ])
        .orderBy("campaign.id", "DESC")
        .skip(
          request.query.page
            ? Number(request.query.page) *
                (request.query.limit ? Number(request.query.limit) : 10)
            : 0
        )
        .take(request.query.limit ? Number(request.query.limit) : 10)
        .getManyAndCount();

      return responseMessage.responseWithData(true, 200, msg.listStartUp, {
        total_count: campaign[1],
        data: campaign[0],
      });
    } catch (error) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.listStartUpFailed,
        error
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
      const startUpList: any = await this.userRepository
        .createQueryBuilder("user")
        .where("user.is_active=true AND user.id=:id", { id: request.params.id })

        .getOne();

      const tagged = await this.taggedRepository
        .createQueryBuilder("tagged")

        .leftJoinAndSelect(
          "tagged.RelationManager",
          "RelationManager",
          "RelationManager.is_active=true AND RelationManager.is_deleted=false"
        )
        .andWhere("RelationManager.id IS NOT NULL")
        .loadRelationCountAndMap(
          "RelationManager.rm_tagged_count",
          "RelationManager.tagged",
          "tagged",
          (qb) => qb.andWhere("tagged.is_active=true ")
        )
        .orderBy("tagged.updatedDate", "DESC")
        .limit(3)
        .getMany();

      startUpList.tagged = tagged;
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
        .where("user.is_active=true AND user.role_id=1")
        .orderBy("user.id", "DESC");

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
        .loadRelationCountAndMap(
          "user.investor_count",
          "campaign.fund",
          "fund",
          (qb) => qb.andWhere("fund.is_active=true")
        )
        .loadRelationCountAndMap("user.total_campaigns", "user.campaign")
        .andWhere("tagged.id IS NOT NULL")

        .select([
          "user.id",
          "user.first_name",
          "user.last_name",
          "user.sector",
          "user.company_name",
          "user.country",
          "user.profile",
          "RelationManager.id",
          "RelationManager.first_name",
          "RelationManager.last_name",
          "tagged.id",
          "tagged.updatedDate",
          "campaign.id",
        ])
        .orderBy("tagged.updatedDate", "DESC")
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
        .where("user.is_active=true AND user.role_id=1")
        .orderBy("user.id", "DESC");

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

      startUpQueryBuilder
        .leftJoinAndSelect("user.tagged", "tagged", "tagged.is_active=true")
        .leftJoinAndSelect("tagged.RelationManager", "RelationManager")
        .leftJoinAndSelect("user.campaign", "campaign")
        .loadRelationCountAndMap(
          "user.investor_count",
          "campaign.fund",
          "fund",
          (qb) => qb.andWhere("fund.is_active=true")
        )
        .loadRelationCountAndMap("user.total_campaigns", "user.campaign")
        .andWhere("tagged.id IS NULL")
        .select([
          "user.id",
          "user.first_name",
          "user.last_name",
          "user.company_name",
          "user.sector",
          "user.profile",
          "user.country",
          "RelationManager.id",
          "RelationManager.first_name",
          "RelationManager.last_name",
          "campaign.id",
        ]);

      if (request.query.page != "full") {
        startUpQueryBuilder
          .skip(
            request.query.page
              ? Number(request.query.page) *
                  (request.query.limit ? Number(request.query.limit) : 10)
              : 0
          )
          .take(request.query.limit ? Number(request.query.limit) : 10);
      }
      const startUpList = await startUpQueryBuilder.getManyAndCount();

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
