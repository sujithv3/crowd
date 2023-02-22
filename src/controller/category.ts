import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Category } from "../entity/category";
const responseMessage = require("../configs/response");
const msg = require("../configs/message");

export class categoryController {
  private categoryRepository = AppDataSource.getRepository(Category);

  // list all
  async all(request: Request, response: Response, next: NextFunction) {
    try {
      const categoryData = await this.categoryRepository.find({
        where: {
          is_active: true,
          is_deleted: false,
        },
      });

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
      const category = await this.categoryRepository.findOne({
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

      //   create category
      this.categoryRepository.save({
        name,
        parent_id,
        is_active,
        is_deleted,
        createdDate: new Date(),
        updatedDate: new Date(),
      });
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
      this.categoryRepository.save({
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

      let categoryToRemove = await this.categoryRepository.findOneBy({ id });

      if (!categoryToRemove) {
        return responseMessage.responseMessage(
          false,
          400,
          msg.categoryNotFound
        );
      }
      await this.categoryRepository.remove(categoryToRemove);
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
