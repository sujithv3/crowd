import { AppDataSource } from "../../../data-source";
import { NextFunction, Request, Response } from "express";
import { Campaigns } from "../../../entity/campaigns";
const responseMessage = require("../../../configs/response");
const msg = require("../../../configs/message");
const Jwt = require("../../../utils/jsonwebtoken");

export class basicInfoController {
  private basicInfoRepository = AppDataSource.getRepository(Campaigns);

  //   create start up
  async create(req: any, res: Response, next: NextFunction) {
    try {
      const {
        id,
        title,
        tag_line,
        primary_category,
        primary_sub_category,
        location,
        tag,
        demo_url,
      } = req.body;

      // get user id

      const user = Jwt.decode(req.cookies.token);
      delete user.role;

      // find campaign start up

      const campaigns = await this.basicInfoRepository.findOne({
        where: {
          is_active: true,
          is_published: false,
          user: user[0].id,
        },
      });

      await this.basicInfoRepository
        .createQueryBuilder()
        .update(Campaigns)
        .set({
          title,
          tag_line,
          primary_category,
          primary_sub_category,
          location,
          tag,
          project_image: req.files.project_image[0].location,
          project_video: req.files.project_video[0].location,
          demo_url,
        })
        .where("id = :id", { id: id ? id : campaigns.id })
        .execute();

      return responseMessage.responseMessage(
        true,
        200,
        msg.basicCampaignCreateSuccess
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.basicCampaignCreateFailed,
        err
      );
    }
  }

  // list basic info
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      // find user
      const user = Jwt.decode(req.cookies.token);
      delete user.role;
      //   find basic info
      const basicCampaigns = await this.basicInfoRepository.findOne({
        select: [
          "id",
          "title",
          "tag_line",
          "location",
          "tag",
          "project_image",
          "project_video",
          "demo_url",
        ],
        where: {
          is_published: false,
          user: user[0].id,
        },
        relations: {
          primary_sub_category: true,
          primary_category: true,
        },
      });
      return responseMessage.responseWithData(
        true,
        200,
        msg.basicCampaignListSuccess,
        basicCampaigns
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.basicCampaignListFailed,
        err
      );
    }
  }
}
