import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { rmAdmin } from "../../entity/rmAdmin";
import { Users } from "../../entity/Users";
import { Campaigns } from "../../entity/campaigns";
import { Funds } from "../../entity/funds";
const responseMessage = require("../../configs/response");
const msg = require("../../configs/message");
const Jwt = require("../../utils/jsonwebtoken");

export class rmSalesList {
    private userRepository = AppDataSource.getRepository(Users);
    private campaignRepository = AppDataSource.getRepository(Campaigns);
    private rmRepository = AppDataSource.getRepository(rmAdmin);
    private fundsRepository = AppDataSource.getRepository(Funds);

    // list start up
    async getSalesList(request: Request, response: Response, next: NextFunction) {
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

            const user = Jwt.decode(token);
            console.log("user", user);

            const userData = await this.rmRepository
                .createQueryBuilder("user")
                .where("user.is_active=true AND user.role_id=5")
                .leftJoinAndSelect("user.taggedsales", "taggedsales", "taggedsales.is_active = true")
                .andWhere("taggedsales.rm_id = :id", { id: user[0].id })
                .skip(
                    request.query.page
                        ? Number(request.query.page) *
                        (request.query.limit ? Number(request.query.limit) : 10)
                        : 0
                )
                .take(request.query.limit ? Number(request.query.limit) : 10)
                .getManyAndCount();
            //   check user exist

            if (userData[1] === 0) {
                return responseMessage.responseMessage(false, 400, msg.user_not_found);
            }
            return responseMessage.responseWithData(
                true,
                200,
                msg.userListSuccess,
                {
                    total_count: userData[1],
                    data: userData[0]
                }
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

    // assign start up
    async assignedStartup(
        request: Request,
        response: Response,
        next: NextFunction
    ) {
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

            const user = Jwt.decode(token);
            console.log("user", user);

            const startUpQueryBuilder = this.userRepository
                .createQueryBuilder("user")
                .where("user.is_active=true AND user.role_id=1")
                .orderBy("user.id", "DESC");

            if (request.query.country) {
                startUpQueryBuilder.andWhere("user.country=:country", {
                    country: request.query.country,
                });
            }
            if (request.query.sector) {
                startUpQueryBuilder.andWhere("user.sector  LIKE :sector", {
                    sector: `%${request.query.sector}%`,
                });
            }

            const salesList = await startUpQueryBuilder
                .leftJoinAndSelect("user.tagged", "tagged", "tagged.is_active=true")
                .leftJoinAndSelect("user.taggedSalesStartup", "taggedSalesStartup", "taggedSalesStartup.is_active=true")
                .leftJoinAndSelect("tagged.RelationManager", "RelationManager")
                .leftJoinAndSelect("taggedSalesStartup.Sales", "Sales")
                .andWhere("tagged.rm_id = :id", { id: user[0].id })
                .andWhere("taggedSalesStartup.id IS NOT NULL")

                .select([
                    "user.id",
                    "user.first_name",
                    "user.last_name",
                    "user.sector",
                    "user.company_name",
                    "user.country",
                    "user.profile",
                    "RelationManager.id",
                    "RelationManager.first_name",
                    "RelationManager.last_name",
                    "tagged.id",
                    "tagged.updatedDate",
                    "taggedSalesStartup.id",
                    "Sales.first_name",
                    "Sales.last_name"
                ])
                .orderBy("tagged.updatedDate", "DESC")
                .skip(
                    request.query.page
                        ? Number(request.query.page) *
                        (request.query.limit ? Number(request.query.limit) : 10)
                        : 0
                )
                .take(request.query.limit ? Number(request.query.limit) : 10)
                .getManyAndCount();

            return responseMessage.responseWithData(true, 200, msg.listStartUp, {
                total_count: salesList[1],
                data: salesList[0],
            });
        } catch (error) {
            console.log(error);

            return responseMessage.responseWithData(
                false,
                400,
                msg.listStartUpFailed,
                error
            );
        }
    }

    // unassign start up
    async unAssignedStartup(
        request: Request,
        response: Response,
        next: NextFunction
    ) {
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

            const user = Jwt.decode(token);
            console.log("user", user);

            const startUpQueryBuilder = this.userRepository
                .createQueryBuilder("user")
                .where("user.is_active=true AND user.role_id=1")
                .orderBy("user.id", "DESC");


            if (request.query.country) {
                startUpQueryBuilder.andWhere("user.country=:country", {
                    country: request.query.country,
                });
            }

            if (request.query.sector) {
                startUpQueryBuilder.andWhere("user.sector  LIKE :sector", {
                    sector: `%${request.query.sector}%`,
                });
            }

            startUpQueryBuilder
            .leftJoinAndSelect("user.tagged", "tagged", "tagged.is_active=true")
            .leftJoinAndSelect("user.taggedSalesStartup", "taggedSalesStartup", "taggedSalesStartup.is_active=true")
            .leftJoinAndSelect("tagged.RelationManager", "RelationManager")
            .andWhere("tagged.rm_id = :id", { id: user[0].id })
            .andWhere("taggedSalesStartup.id IS NULL")

                .select([
                    "user.id",
                    "user.first_name",
                    "user.last_name",
                    "user.sector",
                    "user.company_name",
                    "user.country",
                    "user.profile",
                    "RelationManager.id",
                    "RelationManager.first_name",
                    "RelationManager.last_name",
                    "tagged.id",
                    "tagged.updatedDate"
                ])
            if (request.query.page != "full") {
                startUpQueryBuilder
                    .skip(
                        request.query.page
                            ? Number(request.query.page) *
                            (request.query.limit ? Number(request.query.limit) : 10)
                            : 0
                    )
                    .take(request.query.limit ? Number(request.query.limit) : 10);
            }
            const startUpList = await startUpQueryBuilder.getManyAndCount();

            return responseMessage.responseWithData(true, 200, msg.listStartUp, {
                total_count: startUpList[1],
                data: startUpList[0],
            });
        } catch (error) {
            console.log(error);

            return responseMessage.responseWithData(
                false,
                400,
                msg.listStartUpFailed,
                error
            );
        }
    }
}