// created by : vijay
// purpose : location table create update delete and list

import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Cms } from "../entity/cms";
const responseMessage = require("../configs/response");
const msg = require("../configs/message");

export class cmsController {
  private cmsRepository = AppDataSource.getRepository(Cms);

  // list all
  async all(request: Request, response: Response, next: NextFunction) {
    try {
      const HomePageData = await this.cmsRepository
        .createQueryBuilder("cms")
        .getRawMany();
      return responseMessage.responseWithData(
        true,
        200,
        msg.homepage_templates_list_success,
        HomePageData
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.homepage_templates_list_failed,
        err
      );
    }
  }

  async save(request: Request, response: Response, next: NextFunction) {
    try {

      const id = request.body.id;

      const CMSExists = await this.cmsRepository
        .createQueryBuilder("cms")
        .where('id=:id', { id: request.params.id })
        .getOne();

      if (CMSExists) {
        const params = request.body.params;
        const content = request.body.content;
        await this.cmsRepository
          .createQueryBuilder("cms")
          .update()
          .set({
            params: params,
            content: content
          })
          .where('id=:id', { id: request.params.id })
          .execute();
      }

      return responseMessage.responseWithData(
        true,
        200,
        msg.homepage_templates_list_success
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.homepage_templates_list_failed,
        err
      );
    }
  }
}