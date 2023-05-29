// created by : Muthukumar
// purpose : CMS for handling website contents

import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Cms } from "../entity/cms";
const responseMessage = require("../configs/response");
const msg = require("../configs/message");
import { deleteS3BucketValues } from "../utils/file-upload";
import { In } from "typeorm";
function updateObject(object: any, path: string, newValue: any) {

  const stack = path.split('>');

  while (stack.length > 1) {
    object = object[stack.shift() as string];
  }

  object[stack.shift() as string] = newValue;

}

function getObject(object: any, path: string) {

  const stack = path.split('>');

  while (stack.length > 1) {
    object = object[stack.shift() as string];
  }

  return object[stack.shift() as string];

}

export class cmsController {
  private cmsRepository = AppDataSource.getRepository(Cms);

  // list all
  async all(request: Request, response: Response, next: NextFunction) {
    try {
      const Cms = this.cmsRepository
        .createQueryBuilder("cms").where('is_active=true');

      if (request.query.type && request.query.type !== 'all') {
        Cms.andWhere('type=:type', { type: request.query.type });
      }

      if (request.query.search && parseInt(request.query.search.length.toString()) > 2) {
        Cms.andWhere('title LIKE :search', { search: '%' + request.query.search + '%' });
      }

      const totalQuery = Cms.clone();
      const total_count = await totalQuery.getCount();

      if (request.query.page && request.query.limit) {
        Cms
          .offset(
            request.query.page
              ? Number(request.query.page) *
              (request.query.limit ? Number(request.query.limit) : 10)
              : 0
          )
          .limit(request.query.limit ? Number(request.query.limit) : 10);
      }


      const cmsData = await Cms.orderBy("createdDate").getRawMany();
      return responseMessage.responseWithData(
        true,
        200,
        msg.homepage_templates_list_success,
        {
          data: cmsData,
          total_count: total_count
        }
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.homepage_templates_list_failed,
        err
      );
    }
  }

  async getByTag(request: Request, response: Response, next: NextFunction) {
    try {
      let tags = request.body.tag;

      console.log('tags', tags);
      if (Array.isArray(tags)) {
        tags.push('global');
      }
      else {
        tags = ['global'];
      }

      const HomePageData = await this.cmsRepository
        .createQueryBuilder("cms")
        .where('page IN (:tags)', { tags: tags })
        .getRawMany();
      return responseMessage.responseWithData(
        true,
        200,
        msg.homepage_templates_list_success,
        HomePageData
      );
    } catch (err) {
      console.log('err', err);
      return responseMessage.responseWithData(
        false,
        400,
        msg.homepage_templates_list_failed,
        err
      );
    }
  }

  async getOne(request: Request, response: Response, next: NextFunction) {
    try {
      const HomePageData = await this.cmsRepository
        .createQueryBuilder("cms")
        .where('id=:id', { id: request.params.id })
        .getRawOne();
      return responseMessage.responseWithData(
        true,
        200,
        msg.homepage_templates_list_success,
        HomePageData
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.homepage_templates_list_failed,
        err
      );
    }
  }

  async save(request: any, response: Response, next: NextFunction) {
    try {

      const id = request.body.id;
      console.log('upload files', request.files);
      const CMSExists = await this.cmsRepository
        .createQueryBuilder("cms")
        .where('id=:id', { id: id })
        .getOne();
      if (CMSExists) {
        const params = JSON.parse(request.body.params);
        const content = request.body.content;
        const title = request.body.title;
        console.log('before Params', JSON.stringify(params));
        // modify params 
        // for (let param in params) {
        //   const val = params[param];
        //   if (val.type === 'image') {
        //     const NewImageExist = request.files.find((item: any) => item.fieldname === param);
        //     if (NewImageExist && NewImageExist?.location) {
        //       // delete old image
        //       console.log('val.value', val.value);
        //       if (val.value) {
        //         const getKey = val.value.split("/");
        //         if (getKey.length > 1) {
        //           const key = getKey[getKey.length - 1];
        //           await deleteS3BucketValues(key);
        //         }
        //       }

        //       val.value = NewImageExist?.location;
        //     }
        //   }
        // }
        for (let i = 0; i < request.files.length; ++i) {
          const file = request.files[i];
          // get existing value && delete old fies
          const old_url = getObject(params, file.fieldname);
          if (old_url) {
            const getKey = old_url.split("/");
            if (getKey.length > 1) {
              const key = getKey[getKey.length - 1];
              await deleteS3BucketValues(key);
            }
          }
          updateObject(params, file.fieldname, file.location);
        }

        console.log('request.files', request.files);
        console.log('set Params', JSON.stringify(params));
        await this.cmsRepository
          .createQueryBuilder("cms")
          .update()
          .set({
            params: params,
            content: content,
            title: title
          })
          .where('id=:id', { id: CMSExists.id })
          .execute();
      }

      return responseMessage.responseWithData(
        true,
        200,
        msg.homepage_templates_list_success
      );
    } catch (err) {
      console.log('err', err);
      return responseMessage.responseWithData(
        false,
        400,
        msg.homepage_templates_list_failed,
        err
      );
    }
  }
}