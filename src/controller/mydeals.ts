// created by : vijay
// purpose : category table create update delete and list

import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { MyDeals } from "../entity/mydeals";
const responseMessage = require("../configs/response");
const msg = require("../configs/message");

export class MydealsController {
  private MyDeals = AppDataSource.getRepository(MyDeals);

  // list all
  async add(request: Request, response: Response, next: NextFunction) {
    try {
      await this.MyDeals.createQueryBuilder()
        .insert()
        .values(request.body.seedData)
        .orIgnore()
        .execute();
      return responseMessage.responseWithData(
        true,
        200,
        msg.categoryListSuccess
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.categoryListFailed,
        err
      );
    }
  }

  async remove(request: Request, response: Response, next: NextFunction) {
    try {
      await this.MyDeals.createQueryBuilder()
        .insert()
        .values(request.body.seedData)
        .orIgnore()
        .execute();
      return responseMessage.responseWithData(
        true,
        200,
        msg.categoryListSuccess
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.categoryListFailed,
        err
      );
    }
  }

  async list(request: Request, response: Response, next: NextFunction) {
    try {
      await this.MyDeals.createQueryBuilder()
        .insert()
        .values(request.body.seedData)
        .orIgnore()
        .execute();
      return responseMessage.responseWithData(
        true,
        200,
        msg.categoryListSuccess
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.categoryListFailed,
        err
      );
    }
  }
}
