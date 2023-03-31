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
        });

      if (!user) {
        return responseMessage.responseMessage(false, 400, msg.user_not_found);
      }
      delete user.password;

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
}
