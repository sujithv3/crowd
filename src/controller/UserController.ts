import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Users } from "../entity/Users";
const { genPass, verifyPass } = require("../utils/password");
const { genToken } = require("../utils/jsonwebtoken");
const responseMessage = require("../configs/response");
const msg = require("../configs/message");

export class UserController {
  private userRepository = AppDataSource.getRepository(Users);

  //   list all users
  async all(request: Request, response: Response, next: NextFunction) {
    try {
      const userData = await this.userRepository.find();

      //   check user exist
      if (userData.length === 0) {
        return responseMessage.responseMessage(false, 400, msg.user_not_found);
      }
      return responseMessage.responseWithData(
        true,
        200,
        msg.userListSuccess,
        userData
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.userListFailed,
        err
      );
    }
  }

  //   list one users
  async one(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        return responseMessage.responseMessage(false, 400, msg.user_not_found);
      }
      return responseMessage.responseWithData(
        true,
        200,
        msg.userListSuccess,
        user
      );
    } catch (error) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.userListFailed,
        error
      );
    }
  }

  //   create user
  async create(request: Request, response: Response, next: NextFunction) {
    try {
      const {
        first_name,
        last_name,
        email_id,
        profile,
        contact_number,
        password,
        deactivate_reason,
        role,
        is_active = true,
      } = request.body;

      // encrypt password
      const encrypt_password: string = genPass(password);

      // create user
      await this.userRepository.save({
        first_name,
        last_name,
        email_id,
        profile,
        contact_number,
        password: encrypt_password,
        deactivate_reason,
        role,
        is_active,
        created_date: new Date(),
        updated_date: new Date(),
      });
      return responseMessage.responseMessage(
        true,
        200,
        msg.user_create_success
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.user_create_failed,
        err
      );
    }
  }
  //   create user
  async update(request: Request, response: Response, next: NextFunction) {
    try {
      const {
        id,
        first_name,
        last_name,
        email_id,
        profile,
        contact_number,

        deactivate_reason,
        role,
        is_active = true,
      } = request.body;

      // create user
      this.userRepository.save({
        id,
        first_name,
        last_name,
        email_id,
        profile,
        contact_number,
        deactivate_reason,
        role,
        is_active,
        updated_date: new Date(),
      });
      return responseMessage.responseMessage(true, 200, msg.userUpdateSuccess);
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.userUpdateFailed,
        err
      );
    }
  }

  //   delete user
  async remove(request: Request, response: Response, next: NextFunction) {
    try {
      const id = parseInt(request.params.id);

      let userToRemove = await this.userRepository.findOneBy({ id });

      if (!userToRemove) {
        return responseMessage.responseMessage(false, 400, msg.user_not_found);
      }
      await this.userRepository.remove(userToRemove);
      return responseMessage.responseMessage(true, 200, msg.userDeleteSuccess);
    } catch (error) {
      return responseMessage.responseMessage(false, 400, msg.userDeleteFailed);
    }
  }

  //   login user
  async login(request: Request, response: Response, next: NextFunction) {
    const { email_id, password } = request.body;
    console.log(request.header);
    // find user

    let user = await this.userRepository.findOneBy({
      email_id,
    });
    if (!user) {
      return responseMessage.responseMessage(false, 400, msg.user_not_found);
    }
    // compare password
    const comparePassword = verifyPass(user.password, password);
    if (!comparePassword) {
      return responseMessage.responseMessage(
        false,
        400,
        msg.userCreationFailed
      );
    }

    // generate jwt token
    delete user.password;
    const jwtToken: string = genToken(user);
    response.cookie("token", jwtToken, { maxAge: 900000, httpOnly: true });
    return responseMessage.responseWithToken(
      true,
      200,
      msg.user_login_success,
      jwtToken
    );
  }
}
