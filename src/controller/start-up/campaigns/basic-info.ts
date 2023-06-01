// created by : vijay
// purpose : start up campaign basic info module create update and list

import { AppDataSource } from "../../../data-source";
import { NextFunction, Request, Response } from "express";
import { Campaigns } from "../../../entity/campaigns";
import { isDataFilled } from "../../../utils/campaignFill";
import { deleteS3BucketValues } from "../../../utils/file-upload";
const responseMessage = require("../../../configs/response");
const msg = require("../../../configs/message");
const Jwt = require("../../../utils/jsonwebtoken");

export class basicInfoController {
  private basicInfoRepository = AppDataSource.getRepository(Campaigns);

  //   create basic info
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
      let token: any;
      if (
        typeof req.cookies.token === "undefined" ||
        req.cookies.token === null
      ) {
        if (!req.headers.authorization) {
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
          token = req.headers.authorization.slice(7);
        }
      } else {
        token = req.cookies.token;
      }

      const user = Jwt.decode(token);
      delete user.role;

      // find campaign basic info

      // const campaigns = await this.basicInfoRepository
      //   .createQueryBuilder()
      //   .where("user_id=:id AND is_active=true AND is_published=false", {
      //     id: user[0].id,
      //   })
      //   .getOne();

      // if (!campaigns) {
      //   return responseMessage.responseMessage(
      //     false,
      //     400,
      //     msg.createStartCampaignFirst
      //   );
      // }

      const { campaigns, filled, message } = await isDataFilled('basicInfo', user[0].id, this.basicInfoRepository, null)
      if (filled === false) {
        return responseMessage.responseMessage(
          false,
          400,
          message
        );
      }

      // delete s3 image

      if (campaigns.project_image) {
        if (req.files) {
          const getKey = campaigns.project_image.split("/");
          const key = getKey[getKey.length - 1];
          await deleteS3BucketValues(key);
        }
      }
      if (campaigns.project_video) {
        if (req.files) {
          const getKey = campaigns.project_video.split("/");
          const key = getKey[getKey.length - 1];
          await deleteS3BucketValues(key);
        }
      }

      // update data

      await this.basicInfoRepository
        .createQueryBuilder()
        .update(Campaigns)
        .set({
          title,
          tag_line,
          location,
          tag,
          project_image: req.files.project_image
            ? req.files.project_image[0]
              ? req.files.project_image[0].location
              : ""
            : req.body.project_image,
          project_video: req.files.project_video
            ? req.files.project_video[0]
              ? req.files.project_video[0].location
              : ""
            : req.body.project_video,
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
      console.log(err);
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
      let token: any;
      if (
        typeof req.cookies.token === "undefined" ||
        req.cookies.token === null
      ) {
        if (!req.headers.authorization) {
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
          token = req.headers.authorization.slice(7);
        }
      } else {
        token = req.cookies.token;
      }

      const user = Jwt.decode(token);
      delete user.role;
      //   find basic info
      const basicCampaigns = await this.basicInfoRepository
        .createQueryBuilder("campaign")
        .where(
          "campaign.user_id=:id AND campaign.is_active=true AND campaign.is_published=false",
          {
            id: user[0].id,
          }
        )
        .leftJoinAndSelect("campaign.location", "project_location")
        .leftJoinAndSelect("campaign.tax_location", "tax_location")
        .select([
          "campaign.id",
          "campaign.title",
          "campaign.tag_line",
          "campaign.location",
          "campaign.tag",
          "tax_location",
          "campaign.project_image",
          "campaign.project_video",
          "campaign.demo_url",
          "project_location",
        ])
        .getOne();

      return responseMessage.responseWithData(
        true,
        200,
        msg.basicCampaignListSuccess,
        basicCampaigns
      );
    } catch (err) {
      console.log(err);
      return responseMessage.responseWithData(
        false,
        400,
        msg.basicCampaignListFailed,
        err
      );
    }
  }
}
