// created by : vijay
// purpose : category table create update delete and list

import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Category } from "../entity/category";
import { Staging } from "../entity/staging";
const responseMessage = require("../configs/response");
const msg = require("../configs/message");

export class SeedController {
  private categoryRepository = AppDataSource.getRepository(Category);
  private Staging = AppDataSource.getRepository(Staging);

  // list all
  async seedStages(request: Request, response: Response, next: NextFunction) {
    try {
      await this.Staging.createQueryBuilder()
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
