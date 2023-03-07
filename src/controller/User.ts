import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Users } from "../entity/Users";
import { ForgetToken } from "../entity/forget-password-token";
const { genPass, verifyPass } = require("../utils/password");
const { genToken } = require("../utils/jsonwebtoken");
const responseMessage = require("../configs/response");
const crypto = require("crypto");
const msg = require("../configs/message");
const Jwt = require("../utils/jsonwebtoken");
const sendEmail = require("../utils/nodemailer/email");

export class UserController {
  private userRepository = AppDataSource.getRepository(Users);
  public forgetTokenRepository = AppDataSource.getRepository(ForgetToken);

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

      // if user check
      const user = await this.userRepository
        .createQueryBuilder()
        .where("email_id=:email_id AND role_id=:role_id", {
          email_id: email_id,
          role_id: role_id,
        })
        .getOne();

      if (user) {
        return responseMessage.responseMessage(
          false,
          400,
          msg.user_already_exist
        );
      }

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
        extra_links: [],
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

  //   list all users
  async all(request: Request, response: Response, next: NextFunction) {
    try {
      const userData = await this.userRepository
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.role", "role")
        .where("user.is_active=:is_active", { is_active: true })
        .getMany();
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
      console.log(err);
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
      delete user.password;

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

  // get profile
  async getProfile(request: Request, response: Response, next: NextFunction) {
    try {
      const userData = Jwt.decode(request.cookies.token);

      const user = await this.userRepository
        .createQueryBuilder()
        .where("id=:id", { id: userData[0].id })
        .getOne();

      if (!user) {
        return responseMessage.responseMessage(false, 400, msg.user_not_found);
      }
      delete user.password;
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

  //   create user or profile
  async update(request: any, response: Response, next: NextFunction) {
    try {
      const {
        id,
        first_name,
        last_name,
        profile,
        contact_number,
        code,
        city,
        email_id,
        company_logo,
        street_name,
        country,
        description,
        summary,
        linked_in,
        facebook,
        twitter,
        you_tube,
        website,
        extra_links,
      } = request.body;

      // get user

      const user = Jwt.decode(request.cookies.token);

      // update user
      await this.userRepository
        .createQueryBuilder("user")
        .update(Users)
        .set({
          first_name,
          last_name,
          profile: request.files ? request.files.profile[0].location : profile,
          contact_number,
          company_logo: request.files
            ? request.files.company_logo[0].location
            : company_logo,
          street_name,
          country,
          code,
          city,
          email_id,
          description,
          summary,
          linked_in,
          facebook,
          twitter,
          you_tube,
          website,
          extra_links: JSON.parse(extra_links),
          updated_date: new Date(),
        })
        .where("id =:id", { id: user[0].id })
        .execute();
      return responseMessage.responseMessage(true, 200, msg.userUpdateSuccess);
    } catch (err) {
      console.log(err);

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
    const { email, password, role } = request.body;
    // find user

    let user = await this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.role", "role")
      .where(
        "user.email_id=:email_id AND user.is_active=:is_active AND user.role_id=:role",
        {
          email_id: email,
          is_active: true,
          role: role,
        }
      )
      .getMany();

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
      sameSite: "none",
      httpOnly: false,
      secure: true,
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
    const { email_id, new_password, old_password, role } = request.body;

    // find user

    let user = await this.userRepository
      .createQueryBuilder()
      .where("email_id=:email AND is_active=:is_active AND role_id=:role", {
        email: email_id,
        is_active: true,
        role: role,
      })
      .getOne();
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
      const { email_id, role } = request.body;
      // find user

      let user = await this.userRepository
        .createQueryBuilder()
        .where("email_id=:email AND is_active=:is_active AND role_id=:role", {
          email: email_id,
          is_active: true,
          role: role,
        })
        .getOne();
      if (!user) {
        return responseMessage.responseMessage(false, 400, msg.user_not_found);
      }

      let token: any = await this.forgetTokenRepository
        .createQueryBuilder()
        .where("user=:id", { id: user.id })
        .getOne();
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
    let token: any = await this.forgetTokenRepository
      .createQueryBuilder()
      .where("user=:id", { id: user.id })
      .getOne();

    // check token exist
    if (token.length === 0) {
      return responseMessage.responseMessage(
        false,
        400,
        msg.createPasswordInvalidToken
      );
    }

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

  // setting
  async setting(req: Request, res: Response) {
    try {
      const user = Jwt.decode(req.cookies.token);

      const { is_active, is_deleted, reason } = req.body;

      await this.userRepository
        .createQueryBuilder()
        .update(Users)
        .set({
          is_active,
          is_deleted,
          deactivate_reason: reason,
        })
        .where("id=:id", { id: user[0].id })
        .execute();
      return responseMessage.responseMessage(true, 200, msg.userUpdateSuccess);
    } catch (err) {
      console.log(err);
      return responseMessage.responseWithData(
        false,
        400,
        msg.userUpdateFailed,
        err
      );
    }
  }
}
