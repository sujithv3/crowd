import { AppDataSource } from "../../../data-source";
import { NextFunction, Request, Response } from "express";
import { Campaigns } from "../../../entity/campaigns";
const responseMessage = require("../configs/response");
const msg = require("../configs/message");

export class CampaignController {
  private rolesRepository = AppDataSource.getRepository(Campaigns);

  //   list all role
  async all(request: Request, response: Response, next: NextFunction) {
    try {
      const userData = await this.rolesRepository.find();

      //   check user exist
      if (userData.length === 0) {
        return responseMessage.responseMessage(false, 400, msg.roleNotFound);
      }
      return responseMessage.responseWithData(
        true,
        200,
        msg.roleListedSuccess,
        userData
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.roleListedFailed,
        err
      );
    }
  }

  //   list one role
  async one(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);
    try {
      const user = await this.rolesRepository.findOne({
        where: { id },
      });

      if (!user) {
        return responseMessage.responseMessage(false, 400, msg.roleNotFound);
      }
      return responseMessage.responseWithData(
        true,
        200,
        msg.roleListedSuccess,
        user
      );
    } catch (error) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.roleListedFailed,
        error
      );
    }
  }

  // create role

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, is_active = true } = req.body;

      //   create roles
      this.rolesRepository.save({
        name,
        is_active,
        created_date: new Date(),
        updated_date: new Date(),
      });
      return responseMessage.responseMessage(
        true,
        200,
        msg.roleCreatedSuccessfully
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.roleCreatedFailed,
        err
      );
    }
  }

  //   update role
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, is_active = true, id } = req.body;

      //   create roles
      this.rolesRepository.save({
        id,
        name,
        is_active,
        updated_date: new Date(),
      });
      return responseMessage.responseMessage(true, 200, msg.roleUpdatedSuccess);
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.roleUpdatedFailed,
        err
      );
    }
  }

  //   delete role
  async remove(request: Request, response: Response, next: NextFunction) {
    try {
      const id = parseInt(request.params.id);

      let roleToRemove = await this.rolesRepository.findOneBy({ id });

      if (!roleToRemove) {
        return responseMessage.responseMessage(false, 400, msg.roleNotFound);
      }
      await this.rolesRepository.remove(roleToRemove);
      return responseMessage.responseMessage(true, 200, msg.roleDeleteSuccess);
    } catch (error) {
      return responseMessage.responseMessage(false, 400, msg.roleDeleteFailed);
    }
  }
}
