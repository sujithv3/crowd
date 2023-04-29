// created by : vijay
// purpose : location table create update delete and list

import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Location } from "../entity/locations";
import { Countries } from "../entity/countries";
import { Cities } from "../entity/cities";
const responseMessage = require("../configs/response");
const msg = require("../configs/message");

export class locationController {
  private locationRepository = AppDataSource.getRepository(Location);
  private countryRepositor = AppDataSource.getRepository(Countries);
  private cityRepository = AppDataSource.getRepository(Cities);

  // get all states
  async all(request: Request, response: Response, next: NextFunction) {
    try {
      const locationData = await this.locationRepository.find({
        where: {
          is_active: true,
          is_deleted: false,
        },
      });

      //   check location exist
      if (locationData.length === 0) {
        return responseMessage.responseMessage(
          false,
          400,
          msg.locationNotFound
        );
      }
      return responseMessage.responseWithData(
        true,
        200,
        msg.locationListSuccess,
        locationData
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.locationListFailed,
        err
      );
    }
  }

  async states(request: Request, response: Response, next: NextFunction) {
    try {
      console.log('request.query.country_code', request.query.country_code);
      const locationData = await this.locationRepository.createQueryBuilder('state').
        innerJoin('state.country_id', 'country').where(
          'country.iso2=:country_code AND is_active=:active', { country_code: request.query.country_code, active: true }
        )
        .orderBy('state.name', 'ASC')
        .getMany();

      //   check location exist
      if (locationData.length === 0) {
        return responseMessage.responseMessage(
          false,
          400,
          msg.locationNotFound
        );
      }
      return responseMessage.responseWithData(
        true,
        200,
        msg.locationListSuccess,
        locationData
      );
    } catch (err) {
      console.log('err', err);
      return responseMessage.responseWithData(
        false,
        400,
        msg.locationListFailed,
        err
      );
    }
  }

  // get all countries
  async countries(request: Request, response: Response, next: NextFunction) {
    try {
      const locationData = await this.countryRepositor.createQueryBuilder('country')
        .orderBy('country.name', 'ASC')
        .getMany();
      //   check location exist
      if (locationData.length === 0) {
        return responseMessage.responseMessage(
          false,
          400,
          msg.locationNotFound
        );
      }
      return responseMessage.responseWithData(
        true,
        200,
        msg.locationListSuccess,
        locationData
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.locationListFailed,
        err
      );
    }
  }

  async cities(request: Request, response: Response, next: NextFunction) {
    try {

      const locationData = await this.cityRepository.createQueryBuilder('city')
        .where(
          'state_id=:id', {
          id: request.params.id
        }
        ).getRawMany();

      //   check location exist
      if (locationData.length === 0) {
        return responseMessage.responseMessage(
          false,
          400,
          msg.locationNotFound
        );
      }
      return responseMessage.responseWithData(
        true,
        200,
        msg.locationListSuccess,
        locationData
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.locationListFailed,
        err
      );
    }
  }

  //   list one
  async one(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);
    try {
      const location = await this.locationRepository.findOne({
        where: { id, is_active: true, is_deleted: false },
      });

      if (!location) {
        return responseMessage.responseMessage(
          false,
          400,
          msg.locationNotFound
        );
      }
      return responseMessage.responseWithData(
        true,
        200,
        msg.locationListSuccess,
        location
      );
    } catch (error) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.locationListFailed,
        error
      );
    }
  }

  //  create

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        country,
        is_active = true,
        is_deleted = false,
      } = req.body;

      //   create location
      await this.locationRepository.save({
        name,
        is_active,
        is_deleted,
        country,
        createdDate: new Date(),
        updatedDate: new Date(),
      });
      return responseMessage.responseMessage(
        true,
        200,
        msg.locationCreateSuccess
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.locationCreateFailed,
        err
      );
    }
  }

  //   update
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        id,
        name,
        location_type,
        country,
        is_active,
        is_deleted = false,
      } = req.body;

      //   update location
      await this.locationRepository.save({
        id,
        name,
        location_type,
        country,
        is_active,
        is_deleted,
        updatedDate: new Date(),
      });
      return responseMessage.responseMessage(
        true,
        200,
        msg.locationUpdateSuccess
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.locationUpdateFailed,
        err
      );
    }
  }

  //   delete
  async remove(request: Request, response: Response, next: NextFunction) {
    try {
      const id = parseInt(request.params.id);

      let locationToRemove = await this.locationRepository.findOneBy({ id });

      if (!locationToRemove) {
        return responseMessage.responseMessage(
          false,
          400,
          msg.locationNotFound
        );
      }
      await this.locationRepository.remove(locationToRemove);
      return responseMessage.responseMessage(
        true,
        200,
        msg.locationDeleteSuccess
      );
    } catch (error) {
      return responseMessage.responseMessage(
        false,
        400,
        msg.locationDeleteFailed
      );
    }
  }
}
