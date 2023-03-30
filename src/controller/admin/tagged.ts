// created by : Muthukumar
// purpose : Campaign list view for carousel view for dashboard & investor

import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { rmAdmin } from "../../entity/rmAdmin";
import { Tagged } from "../../entity/tagged";
const responseMessage = require("../../configs/response");
const msg = require("../../configs/message");
const Jwt = require("../../utils/jsonwebtoken");

export class TaggedRM {
  private taggedRepository = AppDataSource.getRepository(Tagged);
  private userRepository = AppDataSource.getRepository(rmAdmin);

  //   assign rm or start up

  async assignTag(request: Request, response: Response, next: NextFunction) {
    try {
      //   tagged
      const { rm_id, start_up } = request.body;

      for (let i = 0; i < start_up.length; i++) {
        this.taggedRepository.save({
          StartUp: start_up[i],
          RelationManager: rm_id,
          createdDate: new Date(),
          updatedDate: new Date(),
        });
      }
      return responseMessage.responseMessage(true, 200, msg.tagged_success);
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.tagged_failed,
        err
      );
    }
  }

  // un assign rm

  async unAssignTag(request: Request, response: Response, next: NextFunction) {
    try {
      //   tagged
      const { start_up } = request.body;

      for (let i = 0; i < start_up.length; i++) {
        this.taggedRepository
          .createQueryBuilder()
          .update(Tagged)
          .set({
            is_active: false,
          })
          .where("StartUp=:StartUp", { StartUp: start_up[i] })
          .execute();
      }
      return responseMessage.responseWithData(true, 200, msg.un_tagged_success);
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.un_tagged_failed,
        err
      );
    }
  }
}
