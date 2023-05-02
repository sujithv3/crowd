import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { rmAdmin } from "../../entity/rmAdmin";
import { Users } from "../../entity/Users";
import { Campaigns } from "../../entity/campaigns";
import { Funds } from "../../entity/funds";
const responseMessage = require("../../configs/response");
const msg = require("../../configs/message");
const Jwt = require("../../utils/jsonwebtoken");
const json2xls = require("json2xls");
const fs = require("fs");

export class ListSales {
  private userRepository = AppDataSource.getRepository(Users);
  private campaignRepository = AppDataSource.getRepository(Campaigns);
  private rmRepository = AppDataSource.getRepository(rmAdmin);
  private fundsRepository = AppDataSource.getRepository(Funds);



  // list start up
  async getSalesList(request: Request, response: Response, next: NextFunction) {
    try {
      const userDataQuery = await this.rmRepository
        .createQueryBuilder("user")
        .where("user.is_active=true AND user.role_id = 5")
      if (request.query.country) {
        console.log(request.query.country);
        userDataQuery.andWhere("user.country=:country", {
          country: request.query.country,
        });
      }

      const userData = await userDataQuery
        .leftJoinAndSelect("user.taggedsales", "taggedsales", "taggedsales.is_active = true")
        .leftJoinAndSelect("user.city", "city")
        .leftJoinAndSelect("taggedsales.RelationManager", "RelationManager")
        .andWhere("taggedsales.id IS NOT NULL")
        .select([
          "user.id",
          "user.first_name",
          "user.last_name",
          "user.country",
          "user.city",
          "user.sector",
          "city.name",
          "city.state_code",
          "taggedsales.id",
          "RelationManager.id",
          "RelationManager.first_name",
          "RelationManager.last_name"
        ])
        .getManyAndCount();
      //   check user exist

      if (userData[0].length === 0) {
        return responseMessage.responseMessage(false, 400, msg.user_not_found);
      }

      var xls = json2xls(userData[0]);
      fs.writeFileSync('data.xlsx', xls, 'binary');

      // const xlsBuffer = Buffer.from(xls, 'binary');

      // response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      // response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      // response.setHeader('Content-Disposition', 'attachment; filename=data.xlsx');
      // response.send(xlsBuffer);

      return responseMessage.responseWithData(
        true,
        200,
        msg.userListSuccess,
        {
          total_count: userData[1],
          data: userData[0],
          // file: xlsBuffer
        },
        {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename=data.xlsx'
        }

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
        .where("user.is_active=true AND user.id=:id AND user.role_id = 5", { id: request.params.id })
        .leftJoinAndSelect("user.taggedsales", "taggedsales", "taggedsales.is_active = true")
        .leftJoinAndSelect("taggedsales.RelationManager", "RelationManager")
        .andWhere("taggedsales.id IS NOT NULL")
        .getOne();
      //   check user exist

      if (!userData) {
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
        .where("user.is_active=true")
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