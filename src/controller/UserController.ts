import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Users } from "../entity/Users";
import { ForgetToken } from "../entity/forget-password-token";
const { genPass, verifyPass } = require("../utils/password");
const { genToken } = require("../utils/jsonwebtoken");
const responseMessage = require("../configs/response");
const crypto = require("crypto");
const msg = require("../configs/message");
const sendEmail = require("../utils/nodemailer/email");
export class UserController {
  private userRepository = AppDataSource.getRepository(Users);
  public forgetTokenRepository = AppDataSource.getRepository(ForgetToken);

  //   list all users
  async all(request: Request, response: Response, next: NextFunction) {
    try {
      const userData = await this.userRepository.find({
        where: {
          is_active: true,
        },
        relations: {
          role: true,
        },
      });
      // console.log(userData);
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
        where: { id, is_active: true },
        relations: {
          role: true,
        },
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
      console.log(error);
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
        role_id,
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
        role: role_id,
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
        role_id,
        is_active,
      } = request.body;

      // create user
      await this.userRepository.save({
        id,
        first_name,
        last_name,
        email_id,
        profile,
        contact_number,
        deactivate_reason,
        role: role_id,
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

      let userToRemove = await this.userRepository.findOneBy({
        id,
      });

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
    const { email, password } = request.body;
    // find user

    let user = await this.userRepository.find({
      where: {
        email_id: email,
        is_active: true,
      },
      relations: {
        role: true,
      },
    });

    if (user.length === 0) {
      return responseMessage.responseMessage(false, 400, msg.user_not_found);
    }
    // compare password
    const comparePassword = verifyPass(user[0].password, password);

    if (!comparePassword) {
      return responseMessage.responseMessage(
        false,
        400,
        msg.userCreationFailed
      );
    }

    // generate jwt token
    delete user[0].password;
    const jwtToken: string = genToken(user);
    response.cookie("token", jwtToken, {
      maxAge: 900000,
      sameSite: true,
    });
    return responseMessage.responseWithToken(
      true,
      200,
      msg.user_login_success,
      jwtToken
    );
  }

  // log out
  async logOut(request: Request, response: Response, next: NextFunction) {
    // clear cookie

    response.clearCookie("token");
    return responseMessage.responseWithToken(
      true,
      200,
      msg.user_log_out_success
    );
  }

  // change password
  async changePassword(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const { email_id, new_password, old_password } = request.body;

    // find user

    let user = await this.userRepository.findOneBy({
      email_id,
      is_active: true,
    });

    if (!user) {
      return responseMessage.responseMessage(false, 400, msg.user_not_found);
    }
    // compare password
    const comparePassword = verifyPass(user.password, old_password);
    if (!comparePassword) {
      return responseMessage.responseMessage(
        false,
        400,
        msg.userCreationFailed
      );
    }
    // encrypt password
    const encrypt_password: string = genPass(new_password);

    // update password
    user.password = encrypt_password;
    await this.userRepository.save(user);

    return responseMessage.responseMessage(
      true,
      200,
      msg.changePasswordSuccess
    );
  }

  // forget password

  async ForgetPassword(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const { email_id } = request.body;
      // find user

      let user = await this.userRepository.findOneBy({
        email_id,
        is_active: true,
      });
      if (!user) {
        return responseMessage.responseMessage(false, 400, msg.user_not_found);
      }

      let token: any = await this.forgetTokenRepository.find({
        where: {
          user,
        },
      });
      // set token table
      if (token.length === 0) {
        token = await this.forgetTokenRepository.save({
          user,
          token: crypto.randomBytes(32).toString("hex"),
          created_date: new Date(),
          updated_date: new Date(),
        });
      }

      // check token type

      token = token.token ?? token[0].token;

      // generate links
      const link = `${process.env.BASE_URL_CREATE_PASSWORD}create_password/?id=${user.id}&token=${token}`;

      // send email

      await sendEmail(user.email_id, "forget password email", { link }, "");

      return responseMessage.responseMessage(
        true,
        200,
        msg.forgetPasswordSuccess
      );
    } catch (error) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.forgetPasswordFailed,
        error
      );
    }
  }

  // create forget password
  async createPassword(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const id = parseInt(request.params.id);
    const verify_token = request.params.token;
    const { password } = request.body;
    // find user
    let user = await this.userRepository.findOneBy({
      id,
      is_active: true,
    });
    if (!user) {
      return responseMessage.responseMessage(false, 400, msg.user_not_found);
    }

    // find token
    let token: any = await this.forgetTokenRepository.find({
      where: {
        user,
      },
    });

    // check token exist
    if (token.length === 0) {
      return responseMessage.responseMessage(
        false,
        400,
        msg.createPasswordInvalidToken
      );
    }
    console.log(token[0].token);
    console.log(verify_token);

    // compare token
    const compareToken = verify_token === token[0].token;

    if (!compareToken) {
      return responseMessage.responseMessage(
        false,
        400,
        msg.createPasswordInvalidToken
      );
    }

    // encrypt password
    const encrypt_password: string = genPass(password);

    await this.userRepository.update(
      {
        id,
      },
      {
        password: encrypt_password,
      }
    );
    // delete token
    await this.forgetTokenRepository.remove(token[0]);

    return responseMessage.responseMessage(
      false,
      400,
      msg.createPasswordSuccess
    );
  }
}
