// created by : vijay
// purpose : category table create update delete and list

import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Staging } from "../entity/staging";
const responseMessage = require("../configs/response");
const msg = require("../configs/message");

export class stagingController {
  private stagingRepository = AppDataSource.getRepository(Staging);

  // list all
  async all(request: Request, response: Response, next: NextFunction) {
    try {
      const categoryData = await this.stagingRepository
        .createQueryBuilder()
        .select(["name", "id"])
        .where("is_active = 1 AND is_deleted=1")
        .orderBy("name", "ASC")
        .getRawMany();

      //   check category exist
      if (categoryData.length === 0) {
        return responseMessage.responseMessage(
          false,
          400,
          msg.categoryNotFound
        );
      }
      return responseMessage.responseWithData(
        true,
        200,
        msg.categoryListSuccess,
        categoryData
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.categoryListFailed,
        err
      );
    }
  }

  //   list one
  async one(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);
    try {
      const category = await this.stagingRepository.findOne({
        where: { id, is_active: true, is_deleted: false },
      });

      if (!category) {
        return responseMessage.responseMessage(
          false,
          400,
          msg.categoryNotFound
        );
      }
      return responseMessage.responseWithData(
        true,
        200,
        msg.categoryListSuccess,
        category
      );
    } catch (error) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.categoryListFailed,
        error
      );
    }
  }

  //  create

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        parent_id = 0,
        is_active = true,
        is_deleted = false,
      } = req.body;

      const category = new Staging();

      category.name = name;
      category.is_active = is_active;
      category.is_deleted = is_deleted;
      //   create category
      await this.stagingRepository.save(category);

      return responseMessage.responseMessage(
        true,
        200,
        msg.categoryCreateSuccess
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.categoryCreateFailed,
        err
      );
    }
  }

  //   update
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, is_active, parent_id, id, is_deleted = false } = req.body;

      //   update category
      await this.stagingRepository.save({
        id,
        name,
        parent_id,
        is_active,
        is_deleted,
        updatedDate: new Date(),
      });
      return responseMessage.responseMessage(
        true,
        200,
        msg.categoryUpdateSuccess
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.categoryUpdateFailed,
        err
      );
    }
  }

  //   delete
  async remove(request: Request, response: Response, next: NextFunction) {
    try {
      const id = parseInt(request.params.id);

      let categoryToRemove = await this.stagingRepository.findOneBy({ id });

      if (!categoryToRemove) {
        return responseMessage.responseMessage(
          false,
          400,
          msg.categoryNotFound
        );
      }
      await this.stagingRepository.remove(categoryToRemove);
      return responseMessage.responseMessage(
        true,
        200,
        msg.categoryDeleteSuccess
      );
    } catch (error) {
      return responseMessage.responseMessage(
        false,
        400,
        msg.categoryDeleteFailed
      );
    }
  }
}
