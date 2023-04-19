// created by : Muthukumar
// purpose : Campaign list view for carousel view for dashboard & investor

import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { rmAdmin } from "../../entity/rmAdmin";
import { TaggedSalesStartup } from "../../entity/taggedSalesStartup";
const responseMessage = require("../../configs/response");
const msg = require("../../configs/message");
const Jwt = require("../../utils/jsonwebtoken");

export class TaggedSalesStartupTag {
    private taggedRepository = AppDataSource.getRepository(TaggedSalesStartup);
    private userRepository = AppDataSource.getRepository(rmAdmin);

    //   assign rm or start up

    async assignTag(request: Request, response: Response, next: NextFunction) {
        try {
            //   tagged
            const { sales_id, start_up, rm_id } = request.body;
            console.log(request.body);

            for (let i = 0; i < start_up.length; i++) {
                this.taggedRepository.save({
                    StartUp: start_up[i],
                    RelationManager: rm_id,
                    Sales: sales_id,
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
            console.log(request.body);

            for (let i = 0; i < start_up.length; i++) {
                this.taggedRepository
                    .createQueryBuilder()
                    .update(TaggedSalesStartup)
                    .set({
                        is_active: false,
                    })
                    .where("StartUp=:start_up ", {
                        start_up: start_up[i],
                    })
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
