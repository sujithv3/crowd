// created by : Muthukumar
// purpose : Campaign list view for carousel view for dashboard & investor

import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { rmAdmin } from "../../entity/rmAdmin";
import { Users } from "../../entity/Users";
const responseMessage = require("../../configs/response");
const msg = require("../../configs/message");
const Jwt = require("../../utils/jsonwebtoken");

export class RelationManager {
  private startUpRepository = AppDataSource.getRepository(Users);
  private userRepository = AppDataSource.getRepository(rmAdmin);

  async getRmList(request: Request, response: Response, next: NextFunction) {
    try {
      // featured
      // AND campaign.is_featured=1

      const startUpCountsRepository = this.userRepository
        .createQueryBuilder("user")
        .where("user.is_active=true AND user.role_id=3")
        .leftJoin("user.tagged", "tagged", "tagged.is_active=true")
        .leftJoinAndSelect("user.city", "city")
        .orderBy("user.id", "DESC")
        .loadRelationCountAndMap(
          "user.tagged_count",
          "user.tagged",
          "tagged",
          (qb) => qb.andWhere("tagged.is_active=true")
        );

      if (request.query.tagged_status) {
        startUpCountsRepository.andWhere(
          `tagged.id IS ${request.query.tagged_status === "tagged" ? "NOT NULL" : "NULL"
          }`
        );
      }
      if (request.query.country) {
        startUpCountsRepository.andWhere(`user.country =:country`, {
          country: request.query.country,
        });
      }

      const startUpCounts = await startUpCountsRepository
        .skip(
          request.query.page
            ? Number(request.query.page) *
            (request.query.limit ? Number(request.query.limit) : 10)
            : 0
        )
        .take(request.query.limit ? Number(request.query.limit) : 10)
        .getManyAndCount();


        let data = await startUpCounts[0].map((temp:any) => {
          let res = {
            ...temp,
            city_state: temp.city ? `${temp.city.name}, ${temp.city.state_code}` : null
          }
          return res;
        })

      return responseMessage.responseWithData(true, 200, msg.list_success, {
        total_count: startUpCounts[1],
        data: data,
      });
    } catch (err) {
      return responseMessage.responseWithData(false, 400, msg.list_Failed, err);
    }
  }

  // get tagged start up
  async getRmTaggedStartUp(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      // get id from url
      const id = parseInt(request.params.id);
      console.log(id);
      const StartUpData = await this.startUpRepository
        .createQueryBuilder("user")
        .where("user.is_active=true AND user.role_id=1")
        .leftJoinAndSelect(
          "user.tagged",
          "tagged",
          `tagged.is_active=true AND tagged.RelationManager=${id}`
        )
        .loadRelationCountAndMap(
          "user.campaign_count",
          "user.campaign",
          "campaign",
          (qb) => qb.andWhere("campaign.is_active=true")
        )
        .leftJoin("user.campaign", "campaign")
        .loadRelationCountAndMap(
          "user.investor_count",
          "campaign.fund",
          "fund",
          (qb) => qb.andWhere("fund.is_active=true")
        )
        .skip(
          request.query.page
            ? Number(request.query.page) *
            (request.query.limit ? Number(request.query.limit) : 10)
            : 0
        )
        .take(request.query.limit ? Number(request.query.limit) : 10)
        .select([
          "user.id",
          "user.company_name",
          "user.profile",
          "user.sector",
          "user.country",
          "campaign.id",
        ])
        .andWhere("tagged.id IS NOT NULL")
        .getManyAndCount();
      return responseMessage.responseWithData(true, 200, msg.list_success, {
        total_count: StartUpData[1],
        data: StartUpData[0],
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
