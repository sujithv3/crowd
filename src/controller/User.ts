import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Users } from "../entity/Users";
import { ForgetToken } from "../entity/forget-password-token";
import { Cms } from "../entity/cms";
import { NewsletterEmail } from "../entity/newsletter-email";
import { deleteS3BucketValues } from "../utils/file-upload";
const { genPass, verifyPass } = require("../utils/password");
const { genToken } = require("../utils/jsonwebtoken");
const responseMessage = require("../configs/response");
const crypto = require("crypto");
const msg = require("../configs/message");
const Jwt = require("../utils/jsonwebtoken");
const sendEmail = require("../utils/nodemailer/email");
const sendTemplate = require("../utils/nodemailer/template");

export class UserController {
  private userRepository = AppDataSource.getRepository(Users);
  public forgetTokenRepository = AppDataSource.getRepository(ForgetToken);
  public cmsRepository = AppDataSource.getRepository(Cms);
  public NewsletterRepository = AppDataSource.getRepository(NewsletterEmail);

  async test(request: Request) {
    // await sendTemplate("muthukumar.ext@aagnia.com", 'startup-registration', {
    //   startup_name: "Muthukumar",
    //   your_name: "Testig"
    // });

    // await sendTemplate("muthukumar.ext@aagnia.com", 'investor-registration', {
    //   investor_name: "Muthukumar",
    //   your_name: "Investor"
    // });

    // await sendTemplate("muthukumar.ext@aagnia.com", 'verify-email', {
    //   name: "Muthukumar",
    //   verify_link: "https://example.com"
    // });

    //   const htmlTemplate = template(userData.params);

    // get All investors
    // to do match sectors of created campaign
    let page = 0;
    let value_exist = true;
    const paketSize = 5;
    const role_id = 2; //for investors
    while (value_exist) {
      let users = await this.userRepository
        .createQueryBuilder()
        .where(
          "role_id=:role_id AND is_deleted=false AND is_active=true AND subscribed=true",
          {
            role_id: role_id,
          }
        )
        .skip(page * paketSize)
        .take(paketSize)
        .getMany();
      if (users.length < paketSize || !users) {
        // very important to avoid infinite loop
        value_exist = false;
      }
      let paket = users.map((item) => {
        return {
          email: item.email_id,
          name: item.first_name + " " + item.last_name,
          companyname: item.company_name,
          id: item.id,
        };
      });
      let paket_count = paket.length;

      ++page;
      console.log("Page", page);
    }

    // this.NewsletterRepository()
    return responseMessage.responseMessage(true, 200, msg.verifySuccessfully);
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

      // if user check
      const user = await this.userRepository
        .createQueryBuilder()
        .where(
          "email_id=:email_id AND role_id=:role_id AND is_deleted=false AND is_active=true",
          {
            email_id: email_id,
            role_id: role_id,
          }
        )
        .getOne();
      console.log(role_id);

      if (user) {
        return responseMessage.responseMessage(
          false,
          400,
          msg.user_already_exist
        );
      }

      // create user
      const users: any = await this.userRepository.save({
        first_name,
        last_name,
        email_id,
        profile,
        contact_number,
        password: encrypt_password,
        deactivate_reason,
        role: role_id,
        files: [],
        is_active,
        created_date: new Date(),
        updated_date: new Date(),
        extra_links: [],
      });
      // generate Unique code

      await AppDataSource.query(
        "UPDATE users SET user_code = case role_id when 1 then CONCAT('VKCF', LPAD(id,5,'0')) when 2 then CONCAT('VKCI', LPAD(id,5,'0')) end WHERE user_code is NULL"
      );

      // console.log(users);
      const token = await this.forgetTokenRepository.save({
        user: users.id,
        token: crypto.randomBytes(32).toString("hex"),
        created_date: new Date(),
        updated_date: new Date(),
      });
      // console.log(token);

      // send email
      const link = `${process.env.BASE_URL_CREATE_PASSWORD}/?id=${users.id}&token=${token.token}`;

      await sendTemplate(email_id, "verify-email", {
        name: first_name + " " + last_name,
        verify_link: link,
      });

      return responseMessage.responseMessage(
        true,
        200,
        msg.user_create_success
      );
    } catch (err) {
      console.log(err);
      return responseMessage.responseWithData(
        false,
        400,
        msg.user_create_failed,
        err
      );
    }
  }

  // verify email
  async verify(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);
    const verify_token = request.params.token;

    // find user
    let user = await this.userRepository
      .createQueryBuilder()
      .where("id=:id AND is_active=true", {
        id,
      })
      .getRawOne();
    // findOneBy({
    //   id,
    //   is_active: true,
    // })

    if (!user) {
      return responseMessage.responseMessage(false, 400, msg.user_not_found);
    }

    // find token
    let token: any = await this.forgetTokenRepository
      .createQueryBuilder()
      .where("userId=:id", { id: id })
      .getOne();

    // check token exist
    if (!token) {
      return responseMessage.responseMessage(
        false,
        400,
        msg.createPasswordInvalidToken
      );
    }

    // compare token
    const compareToken = verify_token === token.token;

    if (!compareToken) {
      return responseMessage.responseMessage(
        false,
        400,
        msg.createPasswordInvalidToken
      );
    }

    await this.userRepository.update(
      {
        id,
      },
      {
        is_verify: true,
      }
    );

    const getUser = await this.userRepository
      .createQueryBuilder()
      .where("id=:id AND is_active=true", {
        id,
      })
      .getRawOne();

    // // delete token
    await this.forgetTokenRepository.remove(token);
    // send registeration complete mail

    if (getUser.Users_is_verify === 0) {
      if (user.Users_role_id === 1) {
        await sendTemplate(user.Users_email_id, "startup-registration", {
          startup_name: user.Users_first_name + " " + user.Users_last_name,
          your_name: "VK INSVESTMENT",
        });
      } else if (user.Users_role_id === 2) {
        await sendTemplate(user.Users_email_id, "investor-registration", {
          investor_name: user.Users_first_name + " " + user.Users_last_name,
          your_name: "VK INSVESTMENT",
        });
      }
    }

    return responseMessage.responseMessage(true, 200, msg.verifySuccessfully);
  }

  //   list all users
  async all(request: Request, response: Response, next: NextFunction) {
    try {
      const userData = await this.userRepository
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.role", "role")
        .where("user.is_active=true")
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
      let token: any;
      if (
        typeof request.cookies.token === "undefined" ||
        request.cookies.token === null
      ) {
        token = request.headers.authorization.slice(7);
      } else {
        token = request.cookies.token;
      }
      const userData = Jwt.decode(token);

      const user = await this.userRepository
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.city", "city")
        .leftJoinAndSelect("city.state_id", "state")
        .where("user.id=:id", { id: userData[0].id })
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
        stage_of_business,
        summary,
        company_name,
        linked_in,
        sector,
        facebook,
        twitter,
        you_tube,
        website,
        extra_links = [],
        ...NonChangedFiles
      } = request.body;

      // get user

      let token: any;
      if (
        typeof request.cookies.token === "undefined" ||
        request.cookies.token === null
      ) {
        token = request.headers.authorization.slice(7);
      } else {
        token = request.cookies.token;
      }
      let profile_image = profile;
      let company_image = company_logo;

      const FundFiles: any = request.files
        .filter((e: any) => {
          if (e.fieldname === "profile") {
            profile_image = e.location;
          } else if (e.fieldname === "company_logo") {
            company_image = e.location;
          } else {
            return e;
          }
        })
        .map((e: any) => {
          return {
            name: e.fieldname,
            value: e.location,
          };
        });

      for (var prop in NonChangedFiles) {
        if (NonChangedFiles.hasOwnProperty(prop)) {
          var innerObj = {};
          innerObj[prop] = NonChangedFiles[prop];
          const getKey = Object.keys(innerObj)[0];
          FundFiles.push({
            name: getKey,
            value: innerObj[getKey],
          });
        }
      }

      const user = Jwt.decode(token);
      console.log(user[0].id);

      const getProfile = await this.userRepository
        .createQueryBuilder()
        .where("id=:id", { id: user[0].id })
        .getOne();

      console.log(FundFiles);
      // delete s3 image

      if (getProfile.profile) {
        if (request.files.profile) {
          const getKey = getProfile.profile.split("/");
          const key = getKey[getKey.length - 1];
          await deleteS3BucketValues(key);
        }
      }
      if (getProfile.company_logo) {
        if (request.files.company_logo) {
          const getKey = getProfile.company_logo.split("/");
          const key = getKey[getKey.length - 1];
          await deleteS3BucketValues(key);
        }
      }
      console.log(company_name);

      // update user
      await this.userRepository
        .createQueryBuilder("user")
        .update(Users)
        .set({
          first_name,
          last_name,
          profile: profile_image,
          contact_number,
          company_logo: company_image,
          files: FundFiles,
          street_name,
          country,
          code,
          city,
          email_id,
          company_name: company_name ?? "",
          description,
          stage_of_business,
          sector: sector ? JSON.parse(sector) : [],
          summary,
          linked_in: linked_in
            ? linked_in === "null"
              ? null
              : linked_in
            : null,
          facebook: facebook ? (facebook === "null" ? null : facebook) : null,
          twitter: twitter ? (twitter === "null" ? null : twitter) : null,
          you_tube: you_tube ? (you_tube === "null" ? null : you_tube) : null,
          website: website ? (website === "null" ? null : website) : null,
          extra_links: extra_links ? JSON.parse(extra_links) : [],
          updated_date: new Date(),
          is_verify: true,
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
        "user.email_id=:email_id AND is_deleted=:is_deleted AND user.is_active=:is_active AND user.role_id=:role AND user.is_deleted=false",
        {
          email_id: email,
          is_active: true,
          is_deleted: false,
          role: role,
        }
      )
      .getMany();

    if (user.length === 0) {
      return responseMessage.responseMessage(false, 400, msg.user_not_found);
    }

    if (!user[0].is_verify) {
      return responseMessage.responseMessage(false, 400, msg.verifyYourEmail);
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
      domain: "localhost",
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
    let token: any;
    if (
      typeof request.cookies.token === "undefined" ||
      request.cookies.token === null
    ) {
      token = request.headers.authorization.slice(7);
    } else {
      token = request.cookies.token;
    }
    const users = Jwt.decode(token);
    // find user

    let user = await this.userRepository
      .createQueryBuilder()
      .where(
        "id=:id AND is_active=:is_active AND is_deleted=:is_deleted AND role_id=:role",
        {
          id: users[0].id,
          is_active: true,
          is_deleted: false,
          role: users[0].role.id,
        }
      )
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
        .where(
          "email_id=:email AND is_active=:is_active AND is_deleted=:is_deleted AND role_id=:role",
          {
            email: email_id,
            is_active: true,
            is_deleted: false,
            role: role,
          }
        )
        .getOne();
      if (!user) {
        return responseMessage.responseMessage(false, 400, msg.user_not_found);
      }

      let token: any = await this.forgetTokenRepository
        .createQueryBuilder()
        .where("userId=:id", { id: user.id })
        .getOne();
      // set token table
      if (!token) {
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
      const link = `${process.env.BASE_URL_CREATE_PASSWORD}/?resetId=${user.id}&token=${token}`;

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
      is_deleted: false,
    });
    if (!user) {
      return responseMessage.responseMessage(false, 400, msg.user_not_found);
    }

    // find token
    let token: any = await this.forgetTokenRepository
      .createQueryBuilder()
      .where("userId=:id", { id: user.id })
      .getOne();

    // check token exist
    if (!token) {
      return responseMessage.responseMessage(
        false,
        400,
        msg.createPasswordInvalidToken
      );
    }

    // compare token
    const compareToken = verify_token === token.token;

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
    await this.forgetTokenRepository.remove(token);

    return responseMessage.responseMessage(
      true,
      200,
      msg.createPasswordSuccess
    );
  }

  // setting
  async setting(req: Request, res: Response) {
    try {
      let token: any;
      if (
        typeof req.cookies.token === "undefined" ||
        req.cookies.token === null
      ) {
        token = req.headers.authorization.slice(7);
      } else {
        token = req.cookies.token;
      }
      const user = Jwt.decode(token);

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
