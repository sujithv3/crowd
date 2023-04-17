// created by : Muthu
// purpose : Investor get Deals & Category Filter

import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Category } from "../entity/category";
import { Location } from "../entity/locations";
import { Staging } from "../entity/staging";
import { Campaigns, CAMPAIGN_STATUS } from "../entity/campaigns";
import { Funds } from "../entity/funds";
import { Meeting } from "../entity/meeting";
const Jwt = require("./../utils/jsonwebtoken");
const responseMessage = require("./../configs/response");
const msg = require("../configs/message");

const dealSize = [
  {
    min: 0,
    max: 100000,
  },
  {
    min: 100000,
    max: 500000,
  },
  {
    min: 500000,
    max: 2000000,
  },
  {
    min: 200000,
    max: null,
  },
];

export class investorController {
  private categoryRepository = AppDataSource.getRepository(Category);
  private locationRepository = AppDataSource.getRepository(Location);
  private StagingRepository = AppDataSource.getTreeRepository(Staging);
  private campaignRepository = AppDataSource.getTreeRepository(Campaigns);
  private FundRepository = AppDataSource.getTreeRepository(Funds);
  private MeetingRepository = AppDataSource.getTreeRepository(Meeting);
  private manager = AppDataSource.manager;

  // list all
  async getAll(request: Request, response: Response, next: NextFunction) {
    try {
      // get all existing categories from active campaign
      const campaignData = await this.campaignRepository
        .createQueryBuilder("campaign")
        .where(
          `campaign.is_deleted=:is_deleted
           AND campaign.is_active=:is_active`,
          {
            is_deleted: false,
            is_active: true,
          }
        )
        .select("campaign.sub_category_id")
        .groupBy("campaign.sub_category_id")
        .getRawMany();
      const categories = campaignData.map((item) => item.sub_category_id);

      const categoryData = await this.categoryRepository
        .createQueryBuilder("category")
        .select(["category.name", "category.parent_id", "category.id"])
        .leftJoinAndSelect("category", "parent", "category.parent_id=parent.id")
        .where("category.id IN (:...categories)", { categories: categories })
        .getRawMany();

      let hashTable = Object.create(null);
      // Get Tree Structure
      categoryData.forEach((aData) => {
        if (aData.parent_id) {
          if (!hashTable[aData.parent_id])
            hashTable[aData.parent_id] = {
              name: aData.parent_name,
              id: aData.parent_id,
              parent_id: aData.parent_id,
              childNodes: [],
            };

          hashTable[aData.parent_id].childNodes.push({
            name: aData.category_name,
            id: aData.category_id,
          });
        } else {
          hashTable[aData.category_id] = {
            name: aData.category_name,
            id: aData.category_id,
            childNodes: [],
          };
        }
      });

      const categoryTre = Object.values(hashTable);

      const existing_location = await this.campaignRepository
        .createQueryBuilder("campaign")
        .where(
          `campaign.is_deleted=:is_deleted
         AND campaign.is_active=:is_active
         `,
          {
            is_deleted: false,
            is_active: true,
          }
        )
        .select("campaign.tax_location_id")
        .groupBy("campaign.tax_location_id")
        .getRawMany();

      const locationArray = existing_location.map(
        (item) => item.tax_location_id
      );

      const location = await this.locationRepository
        .createQueryBuilder()
        .where("id IN (:...locations)", { locations: locationArray })
        .getMany();

      hashTable = Object.create(null);
      // Get Tree Structure
      location.forEach((aData) => {
        if (!hashTable[aData.country])
          hashTable[aData.country] = {
            name: aData.country,
            id: aData.country,
            childNodes: [],
          };

        hashTable[aData.country].childNodes.push({
          name: aData.name,
          id: aData.id,
        });
      });

      const locationTree = Object.values(hashTable);

      const stages = await this.StagingRepository.createQueryBuilder()
        .where(
          "id IN (SELECT `campaign`.`staging_id` FROM `campaigns` `campaign` WHERE `campaign`.`is_deleted`=0 AND `campaign`.`is_active`=1 GROUP BY `campaign`.`staging_id`)"
        )
        .getMany();

      let queryBuild = this.manager.createQueryBuilder().fromDummy();

      dealSize.forEach((item) => {
        if (item.min && item.max) {
          queryBuild.addSelect(
            `EXISTS(SELECT NULL FROM campaigns where is_active=1 AND is_deleted=0 AND goal_amount BETWEEN ${item.min} AND ${item.max} LIMIT 1) as '${item.min}-${item.max}'`
          );
        }

        if (item.min === 0) {
          queryBuild.addSelect(
            `EXISTS(SELECT NULL FROM campaigns where is_active=1 AND is_deleted=0 AND goal_amount >= ${item.max} LIMIT 1) as '${item.min}-${item.max}'`
          );
        }

        if (item.min && item.max === null) {
          queryBuild.addSelect(
            `EXISTS(SELECT NULL FROM campaigns where is_active=1 AND is_deleted=0 AND goal_amount > ${item.min} LIMIT 1) as '${item.min}-${item.max}'`
          );
        }
      });
      let dealSizeData = await queryBuild.getRawOne();
      const deals = [];

      for (let i in dealSizeData) {
        const val = dealSizeData[i];
        if (val === "1") {
          const arr = i.split("-");
          if (arr[1] === "null") {
            deals.push({ id: i, name: arr[0] + " USD+" });
          } else if (arr[0] === "0") {
            deals.push({ id: i, name: "0 - " + arr[1] + " USD" });
          } else
            deals.push({ id: i, name: arr[0] + " USD - " + arr[1] + " USD" });
        }
      }

      queryBuild = this.manager.createQueryBuilder().fromDummy();
      queryBuild.addSelect(
        `EXISTS(SELECT NULL FROM campaigns where is_active=1 AND is_deleted=0 AND is_featured=1 LIMIT 1) as 'featured'`
      );
      queryBuild.addSelect(
        `EXISTS(SELECT NULL FROM campaigns where is_active=1 AND is_deleted=0 AND raised_fund >= goal_amount LIMIT 1) as 'funded'`
      );

      let sortByData = await queryBuild.getRawOne();
      const sort = [];

      // for (let i in sortByData) {
      //   const val = sortByData[i];
      //   if (val === "1") {
      //     if (i === "featured") {
      //       sort.push({ id: "featured", name: "Featured Deals" });
      //     }
      //     if (i === "funded") {
      //       sort.push({ id: "funded", name: "Successfully Funded Deals" });
      //     }
      //   }
      // }
      sort.push({ id: "featured", name: "Featured Deals" });
      sort.push({ id: "raising", name: "Raising Fund Deals" });
      sort.push({ id: "comingsoon", name: "Closing soon Deals" });

      const data = {
        category: categoryTre,
        location: locationTree,
        stages: stages,
        dealSize: deals,
        sortby: sort,
      };

      return responseMessage.responseWithData(
        true,
        200,
        msg.categoryListSuccess,
        data
      );
    } catch (err) {
      console.log(err);
      return responseMessage.responseWithData(
        false,
        400,
        msg.categoryListFailed,
        err
      );
    }
  }

  // @todo: filter list dynamic
  async filterList(request: Request, response: Response, next: NextFunction) {
    try {
      // get all existing categories from active campaign
      const campaignData = await this.campaignRepository
        .createQueryBuilder("campaign")
        .where(
          `campaign.is_deleted=:is_deleted
           AND campaign.is_active=:is_active`,
          {
            is_deleted: false,
            is_active: true,
          }
        )
        .select("campaign.sub_category_id")
        .groupBy("campaign.sub_category_id")
        .getRawMany();
      const categories = campaignData.map((item) => item.sub_category_id);

      const categoryData = await this.categoryRepository
        .createQueryBuilder("category")
        .select(["category.name", "category.parent_id", "category.id"])
        .leftJoinAndSelect("category", "parent", "category.parent_id=parent.id")
        .where("category.id IN (:...categories)", { categories: categories })
        .getRawMany();

      let hashTable = Object.create(null);
      // Get Tree Structure
      categoryData.forEach((aData) => {
        if (aData.parent_id) {
          if (!hashTable[aData.parent_id])
            hashTable[aData.parent_id] = {
              name: aData.parent_name,
              id: aData.parent_id,
              parent_id: aData.parent_id,
              childNodes: [],
            };

          hashTable[aData.parent_id].childNodes.push({
            name: aData.category_name,
            id: aData.category_id,
          });
        } else {
          hashTable[aData.category_id] = {
            name: aData.category_name,
            id: aData.category_id,
            childNodes: [],
          };
        }
      });

      const categoryTre = Object.values(hashTable);

      const existing_location = await this.campaignRepository
        .createQueryBuilder("campaign")
        .where(
          `campaign.is_deleted=:is_deleted
         AND campaign.is_active=:is_active
         `,
          {
            is_deleted: false,
            is_active: true,
          }
        )
        .select("campaign.tax_location_id")
        .groupBy("campaign.tax_location_id")
        .getRawMany();

      const locationArray = existing_location.map(
        (item) => item.tax_location_id
      );

      const location = await this.locationRepository
        .createQueryBuilder()
        .where("id IN (:...locations)", { locations: locationArray })
        .getMany();

      hashTable = Object.create(null);
      // Get Tree Structure
      location.forEach((aData) => {
        if (!hashTable[aData.country])
          hashTable[aData.country] = {
            name: aData.country,
            id: aData.country,
            childNodes: [],
          };

        hashTable[aData.country].childNodes.push({
          name: aData.name,
          id: aData.id,
        });
      });

      const locationTree = Object.values(hashTable);

      const stages = await this.StagingRepository.createQueryBuilder()
        .where(
          "id IN (SELECT `campaign`.`staging_id` FROM `campaigns` `campaign` WHERE `campaign`.`is_deleted`=0 AND `campaign`.`is_active`=1 GROUP BY `campaign`.`staging_id`)"
        )
        .getMany();

      let queryBuild = this.manager.createQueryBuilder().fromDummy();

      dealSize.forEach((item) => {
        if ((item.min || item.min === 0) && item.max) {
          queryBuild.addSelect(
            `EXISTS(SELECT NULL FROM campaigns where is_active=1 AND is_deleted=0 AND goal_amount BETWEEN ${item.min} AND ${item.max} LIMIT 1) as '${item.min}-${item.max}'`
          );
        }

        // if (item.min === 0) {
        //   queryBuild.addSelect(
        //     `EXISTS(SELECT NULL FROM campaigns where is_active=1 AND is_deleted=0 AND goal_amount >= ${item.max} LIMIT 1) as '${item.min}-${item.max}'`
        //   );
        // }

        if (item.min && item.max === null) {
          queryBuild.addSelect(
            `EXISTS(SELECT NULL FROM campaigns where is_active=1 AND is_deleted=0 AND goal_amount > ${item.min} LIMIT 1) as '${item.min}-${item.max}'`
          );
        }
      });
      let dealSizeData = await queryBuild.getRawMany();
      queryBuild = this.manager.createQueryBuilder().fromDummy();
      queryBuild.addSelect(
        `EXISTS(SELECT NULL FROM campaigns where is_active=1 AND is_deleted=0 AND is_featured=1 LIMIT 1) as 'featured'`
      );
      let sortByData = await queryBuild.getRawMany();

      const data = {
        category: categoryTre,
        location: locationTree,
        stages: stages,
        dealSize: dealSizeData,
        sortby: sortByData,
      };

      return responseMessage.responseWithData(
        true,
        200,
        msg.categoryListSuccess,
        data
      );
    } catch (err) {
      console.log(err);
      return responseMessage.responseWithData(
        false,
        400,
        msg.categoryListFailed,
        err
      );
    }
  }

  async deals(request: Request, response: Response, next: NextFunction) {
    try {
      // get user id
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
      const campaignQueryBuilder = this.campaignRepository
        .createQueryBuilder("campaign")
        .where(
          `campaign.is_published=:published
         AND campaign.is_deleted=:is_deleted
         AND campaign.is_active=:is_active
         AND campaign.status=:status
         `,
          {
            status: CAMPAIGN_STATUS.Approved,
            published: true,
            is_deleted: false,
            is_active: true,
          }
        );

      if (request.query.search) {
        campaignQueryBuilder.andWhere(
          ` (campaign.title LIKE :search OR campaign.description LIKE :search OR campaign.tag_line LIKE :search OR campaign.tag LIKE :search)`,
          {
            search: "%" + request.query.search + "%",
          }
        );
      }

      if (request.query.category) {
        campaignQueryBuilder.andWhere(
          ` (campaign.category_id=:category OR campaign.sub_category_id=:category)`,
          {
            category: request.query.category,
          }
        );
      }

      if (request.query.location) {
        campaignQueryBuilder.andWhere(` campaign.tax_location_id=:location`, {
          location: request.query.location,
        });
      }

      if (request.query.stage) {
        campaignQueryBuilder.andWhere(`campaign.staging_id=:stage`, {
          stage: request.query.stage,
        });
      }

      if (request.query.size) {
        let sizes = (request.query.size as string).split("-");
        campaignQueryBuilder.andWhere(
          `campaign.goal_amount <= :max AND campaign.goal_amount >= :min`,
          {
            min: sizes[0],
            max: sizes[1],
          }
        );
      }

      if (request.query.sortby) {
        if (request.query.sortby === "featured") {
          campaignQueryBuilder.andWhere(`campaign.is_featured = 1`);
        } else if (request.query.sortby === "funded") {
          campaignQueryBuilder.andWhere(` AND raised_fund >= goal_amount`);
        }
      }

      const totalQuery = campaignQueryBuilder.clone();

      const userData = await campaignQueryBuilder
        .skip(
          request.query.page
            ? (Number(request.query.page) - 1) *
            (request.query.limit ? Number(request.query.limit) : 10)
            : 0
        )
        .take(request.query.limit ? Number(request.query.limit) : 10)
        .leftJoinAndSelect("campaign.tax_location", "tax_location")
        .leftJoinAndSelect("campaign.category", "Category")
        .leftJoinAndSelect("campaign.user", "user")
        .leftJoinAndSelect("campaign.subcategory", "subcategory")
        .leftJoinAndSelect(
          "campaign.myDeals",
          "myDeals",
          "myDeals.user_id=:id AND campaign_id=campaign.id",
          {
            id: user[0].id,
          }
        )
        .getMany();

      const total_count = await totalQuery.getCount();

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        { total_count, userData }
      );
    } catch (err) {
      console.log("err", err);
      return responseMessage.responseWithData(
        false,
        400,
        msg.campaignListFailed,
        err
      );
    }
  }

  async addFund(request: Request, response: Response, next: NextFunction) {
    try {
      const { campaign_id } = request.body;

      // get user id
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

      let meeting_id = null;

      if (request.body.req_meeting === "1") {
        let date1 = new Date(request.body.start_time).getTime();
        let date2 = new Date(request.body.end_time).getTime();
        let meeting_date = new Date(request.body.meeting_date).getTime();

        let diff = new Date().getTime() - meeting_date;
        if (diff > 0) {
          return responseMessage.responseWithData(
            false,
            400,
            msg.createFundFail,
            "Meeting Date cannot be past"
          );
        }

        if (date1 > date2) {
          return responseMessage.responseWithData(
            false,
            400,
            msg.createFundFail,
            "End Time Should be greater than start time"
          );
        }

        const meetingExists =
          await this.MeetingRepository.createQueryBuilder().where(
            "user_id=:userid AND meeting_date > NOW() AND campaign_id=:campaignId AND is_active=true",
            {
              userid: user[0].id,
              campaignId: campaign_id,
            }
          );

        if (meetingExists) {
          // reschedule meeting
          // change active meeting to inactive

          await this.MeetingRepository.createQueryBuilder()
            .update()
            .set({
              is_active: false,
            })
            .where(
              "user_id=:userid AND campaign_id=:campaignId AND is_active=true",
              {
                userid: user[0].id,
                campaignId: campaign_id,
              }
            )
            .execute();
        }

        const meeting = await this.MeetingRepository.createQueryBuilder()
          .insert()
          .values({
            user: user[0].id,
            campaign: campaign_id,
            meeting_date: request.body.meeting_date,
            start_time: request.body.start_time,
            end_time: request.body.end_time,
            is_active: true,
            is_deleted: false,
          })
          .execute();

        meeting_id = meeting.raw.insertId;
      }

      // create my_deals

      await this.FundRepository.createQueryBuilder()
        .insert()
        .values({
          investor: user[0].id,
          campaign: campaign_id,
          fund_amount: request.body.fund_amount,
          // currency: request.body.currency,
          expected_invest_date: request.body.expected_invest_date,
          remark: request.body.remark,
          req_meeting: request.body.req_meeting,
          meeting: meeting_id,
          is_active: false,
          is_deleted: false,
        })
        .orIgnore()
        .execute();
      return responseMessage.responseWithData(true, 200, msg.createFund);
    } catch (err) {
      console.log("err", err);
      return responseMessage.responseWithData(
        false,
        400,
        msg.createFundFail,
        err
      );
    }
  }
}
