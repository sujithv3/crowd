import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { rmAdmin } from "../../entity/rmAdmin";
import { Users } from "../../entity/Users";
import { Campaigns } from "../../entity/campaigns";
import { Funds } from "../../entity/funds";
const responseMessage = require("../../configs/response");
const msg = require("../../configs/message");
const Jwt = require("../../utils/jsonwebtoken");

export class ListSales {
  private userRepository = AppDataSource.getRepository(Users);
  private campaignRepository = AppDataSource.getRepository(Campaigns);
  private rmRepository = AppDataSource.getRepository(rmAdmin);
  private fundsRepository = AppDataSource.getRepository(Funds);



  // list start up
  async getSalesList(request: Request, response: Response, next: NextFunction) {
    try {
      const userData = await this.rmRepository
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.role", "role")
        .where("user.is_active=true")
        .andWhere("role.id = :roleId", { roleId: 5 })
        .select([
          "user.id",
          "user.first_name",
          "user.last_name",
          "user.country",
          "user.city",
          "user.sector"
        ])
        .getMany();
      //   check user exist

      if (userData.length === 0) {
        return responseMessage.responseMessage(false, 400, msg.user_not_found);
      }
      return responseMessage.responseWithData(
        true,
        200,
        msg.userListSuccess,
        userData
      );
    } catch (err) {
      console.log(err);
      return responseMessage.responseWithData(
        false,
        400,
        msg.userListFailed,
        err
      );
    }
  }

  // get start up list

  async getSalesUser(request: Request, response: Response, next: NextFunction) {
    try {
      const userData = await this.rmRepository
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.role", "role")
        .where("user.is_active=true AND user.id=:id", { id: request.params.id })
        .andWhere("role.id = :roleId", { roleId: 5 })
        .select([
          "user.id",
          "user.first_name",
          "user.last_name",
          "user.country",
          "user.city",
          "user.sector"
        ])
        .getMany();
      //   check user exist

      if (userData.length === 0) {
        return responseMessage.responseMessage(false, 400, msg.user_not_found);
      }
      return responseMessage.responseWithData(
        true,
        200,
        msg.userListSuccess,
        userData
      );
    } catch (err) {
      console.log(err);
      return responseMessage.responseWithData(
        false,
        400,
        msg.userListFailed,
        err
      );
    }
  }

  // assign start up
  async assignedSales(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const salesQueryBuilder = this.rmRepository
        .createQueryBuilder("user")
        .where("user.is_active=true AND user.role_id=5")
        .orderBy("user.id", "DESC");

      if (request.query.country) {
          salesQueryBuilder.andWhere("user.country=:country", {
          country: request.query.country,
        });
      }
      if (request.query.sector) {
          salesQueryBuilder.andWhere("user.sector  LIKE :sector", {
          sector: `%${request.query.sector}%`,
        });
      }

      const salesList = await salesQueryBuilder
          .leftJoinAndSelect("user.taggedsales", "taggedsales", "taggedsales.is_active = true")
          .leftJoinAndSelect("taggedsales.RelationManager", "RelationManager")    
          .andWhere("taggedsales.id IS NOT NULL")
        
        .select([
          "user.id",
          "user.first_name",
          "user.last_name",
          "user.sector",
          "user.country", 
          "RelationManager.id",
          "RelationManager.first_name",
          "RelationManager.last_name",
          "taggedsales.id",
          "taggedsales.updatedDate",
        ])
        .orderBy("taggedsales.updatedDate", "DESC")
        .skip(
          request.query.page
            ? Number(request.query.page) *
            (request.query.limit ? Number(request.query.limit) : 10)
            : 0
        )
        .take(request.query.limit ? Number(request.query.limit) : 10)
        .getManyAndCount();

      return responseMessage.responseWithData(true, 200, msg.listStartUp, {
        total_count: salesList[1],
        data: salesList[0],
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
  async unAssignedSales(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const salesQueryBuilder = this.rmRepository
        .createQueryBuilder("user")
        .where("user.is_active=true AND user.role_id=5")
        .orderBy("user.id", "DESC");

      if (request.query.country) {
        salesQueryBuilder.andWhere("user.country=:country", {
          country: request.query.country,
        });
      }

      if (request.query.sector) {
        salesQueryBuilder.andWhere("user.sector  LIKE :sector", {
          sector: `%${request.query.sector}%`,
        });
      }

      salesQueryBuilder
        .leftJoinAndSelect("user.taggedsales", "taggedsales", "taggedsales.is_active")
        .leftJoinAndSelect("taggedsales.RelationManager", "RelationManager")
        .andWhere("taggedsales.id IS NULL")
        .select([
          "user.id",
          "user.first_name",
          "user.last_name",
          "user.sector",
          "user.country",
          "RelationManager.id",
          "RelationManager.first_name",
          "RelationManager.last_name",
        ]);

      if (request.query.page != "full") {
        salesQueryBuilder
          .skip(
            request.query.page
              ? Number(request.query.page) *
              (request.query.limit ? Number(request.query.limit) : 10)
              : 0
          )
          .take(request.query.limit ? Number(request.query.limit) : 10);
      }
      const startUpList = await salesQueryBuilder.getManyAndCount();

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