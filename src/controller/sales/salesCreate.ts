import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { rmAdmin } from "../../entity/rmAdmin";
import { rmForgetToken } from "../../entity/rmforget-password-token";
import { deleteS3BucketValues } from "../../utils/file-upload";
const { genPass, verifyPass } = require("../../utils/password");
const { genToken } = require("../../utils/jsonwebtoken");
const responseMessage = require("../../configs/response");
const crypto = require("crypto");
const msg = require("../../configs/message");
const Jwt = require("../../utils/jsonwebtoken");
const sendEmail = require("../../utils/nodemailer/email");

export class UserController {
    private userRepository = AppDataSource.getRepository(rmAdmin);
    public forgetTokenRepository = AppDataSource.getRepository(rmForgetToken);

    //   create user
    async create(request: any, response: Response, next: NextFunction) {
        try {
            const {
                first_name,
                last_name,
                email_id,
                profile,
                contact_number,
                password,
                sector,
                role_id = 5,
                country,
                state,
                city,
                is_active = true,
            } = request.body;

            console.log(request.body);

            // encrypt password
            const encrypt_password: string = genPass(password);

            // if user check
            const user = await this.userRepository
                .createQueryBuilder()
                .where("email_id=:email_id AND role_id=:role_id AND is_deleted=false", {
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

            // console.log(request.files);

            const profId = country == 'US' ? 'SEUSA' : 'SECAN';
            // console.log(profId);

            // create user
            const users: any = await this.userRepository.save({
                first_name,
                last_name,
                email_id,
                profile: request.files.profile
                    ? request.files.profile[0].location
                    : profile,
                profile_id: `${profId}${(
                    "000" +
                    ((await this.userRepository.count()) + 1)
                ).slice(-4)}`,
                contact_number,
                password: encrypt_password,
                role: role_id,
                is_active,
                country,
                state,
                city,
                is_verify: true,
                sector: sector ? JSON.parse(sector) : [],
                created_date: new Date(),
                updated_date: new Date(),
            });
            // console.log(users);
            // const token = await this.forgetTokenRepository.save({
            //   user: users.id,
            //   token: crypto.randomBytes(32).toString("hex"),
            //   created_date: new Date(),
            //   updated_date: new Date(),
            // });
            // console.log(token);

            // send email
            const link = `${process.env.BASE_URL_RMADMIN_CREATE_PASSWORD}/`;

            await sendEmail(
                email_id,
                "Successfully account created",
                { link },
                "",
                "click to login your account"
            );

            return responseMessage.responseMessage(
                true,
                200,
                // msg.user_create_success
                "Account created Successfully"
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
        // delete token
        await this.forgetTokenRepository.remove(token);

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
                city,
                email_id,
                country,
                state,
            } = request.body;

            console.log("data from signup", request.body);

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

            const user = Jwt.decode(token);

            const getProfile = await this.userRepository
                .createQueryBuilder()
                .where("id=:id", { id: user[0].id })
                .getOne();

            // delete s3 image

            if (getProfile.profile) {
                if (request.files.profile) {
                    const getKey = getProfile.profile.split("/");
                    const key = getKey[getKey.length - 1];
                    await deleteS3BucketValues(key);
                }
            }

            // update user
            await this.userRepository
                .createQueryBuilder("user")
                .update(rmAdmin)
                .set({
                    first_name,
                    last_name,
                    profile: request.files.profile
                        ? request.files.profile[0].location
                        : profile,
                    contact_number,
                    country,
                    city,
                    state,
                    email_id,
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
        console.log("this is from sales");
        console.log(email, password, role);
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
            console.log("this is from relation forgot");
            console.log(email_id);
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
            const link = `${process.env.BASE_URL_RMADMIN_CREATE_PASSWORD}/sales-login/?resetId=${user.id}&token=${token}`;

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

        console.log(id, verify_token, password);

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
    // async setting(req: Request, res: Response) {
    //   try {
    //     let token: any;
    //     if (
    //       typeof req.cookies.token === "undefined" ||
    //       req.cookies.token === null
    //     ) {
    //       token = req.headers.authorization.slice(7);
    //     } else {
    //       token = req.cookies.token;
    //     }
    //     const user = Jwt.decode(token);

    //     const { is_active, is_deleted, reason } = req.body;

    //     await this.userRepository
    //       .createQueryBuilder()
    //       .update(rmAdmin)
    //       .set({
    //         is_active,
    //         is_deleted,
    //       })
    //       .where("id=:id", { id: user[0].id })
    //       .execute();
    //     return responseMessage.responseMessage(true, 200, msg.userUpdateSuccess);
    //   } catch (err) {
    //     console.log(err);
    //     return responseMessage.responseWithData(
    //       false,
    //       400,
    //       msg.userUpdateFailed,
    //       err
    //     );
    //   }
    // }
}
