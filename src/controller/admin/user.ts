// created by : Muthukumar
// purpose : Campaign list view for carousel view for dashboard & investor

import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { rmAdmin } from "../../entity/rmAdmin";
import { Tagged } from "../../entity/tagged";
const responseMessage = require("../../configs/response");
const msg = require("../../configs/message");
const Jwt = require("../../utils/jsonwebtoken");

export class User {
  private userRepository = AppDataSource.getRepository(rmAdmin);

  //  list admin

  async listAdmin(request: Request, response: Response, next: NextFunction) {
    try {
      //   admin

      let token: any;
      if (
        typeof request.cookies.token === "undefined" ||
        request.cookies.token === null
      ) {
        if (!request.headers.authorization) {
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
          token = request.headers.authorization.slice(7);
        }
      } else {
        token = request.cookies.token;
      }

      const user = Jwt.decode(token);

      const adminUser = await this.userRepository
        .createQueryBuilder()
        .where("is_active=true AND is_deleted=false AND id=:id", {
          id: user[0].id,
        })
        .getOne();

      if (!adminUser) {
        return responseMessage.responseMessage(false, 400, msg.user_not_found);
      }
      delete adminUser.password;

      return responseMessage.responseWithData(
        true,
        200,
        msg.list_success,
        adminUser
      );
    } catch (err) {
      return responseMessage.responseWithData(false, 400, msg.list_Failed, err);
    }
  }

  // edit
  async edit(request: any, response: Response, next: NextFunction) {
    try {
      let token: any;
      if (
        typeof request.cookies.token === "undefined" ||
        request.cookies.token === null
      ) {
        if (!request.headers.authorization) {
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
          token = request.headers.authorization.slice(7);
        }
      } else {
        token = request.cookies.token;
      }

      console.log(request.files);
      // console.log(request.file);

      const user = Jwt.decode(token);
      const {
        first_name,
        last_name,
        country,
        profile,
        contact_number,
        state,
        city,
      } = request.body;
      const adminUser = await this.userRepository
        .createQueryBuilder()
        .update(rmAdmin)
        .set({
          first_name,
          last_name,
          country,
          contact_number,
          state,
          city,
          profile:
            request.files.length != 0 ? request.files[0].location : profile,
        })
        .where(" id=:id", {
          id: user[0].id,
        })
        .execute();
      return responseMessage.responseWithData(
        true,
        200,
        msg.profile_updated_successfully,
        adminUser
      );
    } catch (error) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.profile_updated_failed,
        error
      );
    }
  }
}
