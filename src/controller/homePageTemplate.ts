// created by : vijay
// purpose : location table create update delete and list

import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Cms } from "../entity/cms";
const responseMessage = require("../configs/response");
const msg = require("../configs/message");

export class homePageTemplateController {
  private cmsRepository = AppDataSource.getRepository(Cms);

  // list all
  async all(request: Request, response: Response, next: NextFunction) {
    try {
      const HomePageData = await this.cmsRepository
      .createQueryBuilder("cms")
      .where(
        `cms.type = :type 
       `,
        {
          type: 'HOME Page',
        }
        
      )
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
}