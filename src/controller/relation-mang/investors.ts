import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
// import { rmAdmin } from "../../entity/rmAdmin";
import { Tagged } from "../../entity/tagged";
import { Campaigns } from "../../entity/campaigns";
import { Funds } from "../../entity/funds";
import { Users } from "../../entity/Users";
import { Meeting } from "../../entity/meeting";
import { MyDeals } from "../../entity/mydeals";
import axios from "axios";
const { genToken } = require("../../utils/jsonwebtoken");
const responseMessage = require("../../configs/response");
const crypto = require("crypto");
const msg = require("../../configs/message");
const Jwt = require("../../utils/jsonwebtoken");
const sendEmail = require("../../utils/nodemailer/email");

export class InvestorController {
  //   private userRepository = AppDataSource.getRepository(rmAdmin);
  private campaignRepository = AppDataSource.getRepository(Campaigns);
  private userRepository = AppDataSource.getRepository(Users);
  private fundsRepository = AppDataSource.getRepository(Funds);
  private MeetingRepository = AppDataSource.getRepository(Meeting);
  private MyDealsRepository = AppDataSource.getRepository(MyDeals);
  private TaggedRepository = AppDataSource.getRepository(Tagged);

  //list all investors
  async getInvestorsList(
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

      const investorListQuery = await this.userRepository
        .createQueryBuilder("investor")
        .where("investor.is_deleted=false AND investor.role_id=2");

      if (typeof request.query.status !== "undefined") {
        investorListQuery.andWhere("investor.is_active=:status", {
          status: request.query.status,
        });
      }

      if (request.query.from_date && request.query.to_date) {
        const formatDate = (date) => {
          let convertedDate = new Date(date);
          // .toISOString();
          // .replace(/T/, " ") // replace T with a space
          // .replace(/\..+/, "");
          return convertedDate;
        };

        investorListQuery.andWhere("investor.created_date >= :start_dates  ", {
          start_dates: formatDate(request.query.from_date),
        });
        investorListQuery.andWhere("investor.created_date <= :end_date ", {
          end_date: formatDate(request.query.to_date),
        });
      }

      const investorList = await investorListQuery
        .skip(
          request.query.page
            ? Number(request.query.page) *
                (request.query.limit ? Number(request.query.limit) : 10)
            : 0
        )
        .take(request.query.limit ? Number(request.query.limit) : 10)
        .getManyAndCount();

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        {
          total_count: investorList[1],
          data: investorList[0],
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

  //   list all users
  async interested(request: Request, response: Response, next: NextFunction) {
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

      const campaign = await this.TaggedRepository.createQueryBuilder("tagged")
        .innerJoin("tagged.StartUp", "startup") // get tagged startup
        .innerJoin(
          "startup.campaign",
          "campaign",
          "campaign.is_deleted=false AND campaign.is_published=true"
        ) // get campaign details for tagged users
        .innerJoin("campaign.myDeals", "mydeals") // get mydeals
        .innerJoin("mydeals.user", "user")
        .where(
          "tagged.rm_id = :id AND tagged.is_active=true AND user.is_deleted=false",
          {
            id: user[0].id,
          }
        )
        .distinct();
      if (request.query.country && request.query.country !== "all") {
        campaign.andWhere("user.country=:country", {
          country: request.query.country,
        });
      }
      if (
        typeof request.query.fund_amount === "string" &&
        request.query.fund_amount !== "all"
      ) {
        console.log(request.query.fund_amount);
        const range = request.query.fund_amount.split("-");
        const min = Number(range[0]);
        const max = Number(range[1]);

        console.log("dfasfas", min, max);

        if (min == 0) {
          // allow null values also
          campaign.andWhere(
            "EXISTS (SELECT SUM(funds.fund_amount) as total_fund FROM funds WHERE funds.investorId=user.id HAVING ((total_fund >= :min AND total_fund <= :max) OR total_fund IS NULL))",
            {
              min: min,
              max: max,
            }
          );
        } else if (isNaN(max)) {
          campaign.andWhere(
            "EXISTS (SELECT SUM(funds.fund_amount) as total_fund FROM funds WHERE funds.investorId=user.id HAVING (total_fund > :min))",
            {
              min: min,
            }
          );
        } else {
          campaign.andWhere(
            "EXISTS (SELECT SUM(funds.fund_amount) as total_fund FROM funds WHERE funds.investorId=user.id HAVING (total_fund >= :min AND total_fund <= :max))",
            {
              min: min,
              max: max,
            }
          );
        }
      }

      const total_query = campaign.clone();

      const total_count_result: any = await total_query
        .select("COUNT(DISTINCT `user`.`id`) AS `count`")
        .getRawOne();

      console.log("total_count_result", total_count_result);

      const total_count = total_count_result
        ? total_count_result?.count || 0
        : 0;

      campaign
        .select([
          "user.id",
          "user.first_name",
          "user.last_name",
          "user.city",
          "user.country",
        ])
        .addSelect(
          "(SELECT SUM(funds.fund_amount) FROM funds WHERE funds.investorId=user.id)",
          "fund_amount"
        );

      if (request.query.page && request.query.limit) {
        campaign
          .offset(
            request.query.page
              ? Number(request.query.page) *
                  (request.query.limit ? Number(request.query.limit) : 10)
              : 0
          )
          .limit(request.query.limit ? Number(request.query.limit) : 10);
      }

      const data = await campaign.getRawMany();

      const item = {
        total_count,
        data,
      };

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        item
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

  async funded(request: Request, response: Response, next: NextFunction) {
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

      const campaign = await this.fundsRepository
        .createQueryBuilder("fund")
        .innerJoinAndSelect("fund.investor", "investor")
        .innerJoinAndSelect(
          "fund.campaign",
          "campaign",
          "campaign.is_deleted=false AND campaign.is_published=true"
        )
        .innerJoinAndSelect("campaign.location", "location")
        .innerJoin("campaign.user", "startup")
        .innerJoin("startup.tagged", "tagged")
        .where("tagged.rm_id = :userId AND tagged.is_active=true", {
          userId: user[0].id,
        })
        .select([
          "investor.id",
          "investor.first_name",
          "investor.last_name",
          "investor.city",
          "investor.country",
          "startup.company_name",
          "startup.stage_of_business",
          "campaign.title",
          "location.name",
          "location.country",
          "fund.fund_amount",
        ]);
      if (request.query.stage && request.query.stage !== "all") {
        console.log(request.query.stage);
        campaign.andWhere("startup.stage_of_business=:stage", {
          stage: request.query.stage,
        });
      }
      if (
        typeof request.query.fund_amount === "string" &&
        request.query.fund_amount !== "all"
      ) {
        console.log(request.query.fund_amount);
        const range = request.query.fund_amount.split("-");
        const min = Number(range[0]);
        const max = Number(range[1]);
        if (isNaN(max)) {
          campaign.andWhere("(fund.fund_amount > :min)", {
            min: min,
          });
        } else {
          campaign.andWhere(
            "(fund.fund_amount >= :min AND fund.fund_amount <= :max)",
            {
              min: min,
              max: max,
            }
          );
        }
      }
      const total_count = await campaign.getCount();
      if (request.query.page && request.query.limit) {
        campaign
          .offset(
            request.query.page
              ? Number(request.query.page) *
                  (request.query.limit ? Number(request.query.limit) : 10)
              : 0
          )
          .limit(request.query.limit ? Number(request.query.limit) : 10);
      }

      const data = await campaign.getRawMany();

      const item = {
        total_count,
        data,
      };

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        item
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

  async campaign(request: Request, response: Response, next: NextFunction) {
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

      const id = parseInt(request.params.id);
      const user = Jwt.decode(token);

      console.log("user", user);

      const campaign = await this.campaignRepository
        .createQueryBuilder("campaign")
        .innerJoinAndSelect("campaign.fund", "fund")
        .innerJoinAndSelect("campaign.location", "location")
        .where("fund.investorId = :id", {
          id: id,
        })
        .select([
          "campaign.title",
          "location.name",
          "location.country",
          "fund.fund_amount as fund_amount",
        ]);
      const total_count = await campaign.getCount();
      if (request.query.page && request.query.limit) {
        campaign
          .offset(
            request.query.page
              ? Number(request.query.page) *
                  (request.query.limit ? Number(request.query.limit) : 10)
              : 0
          )
          .limit(request.query.limit ? Number(request.query.limit) : 10);
      }

      const data = await campaign.getRawMany();

      const item = {
        total_count,
        data,
      };

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        item
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

  async meetingList(request: Request, response: Response, next: NextFunction) {
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

      // const campaignQuery = await this.MeetingRepository.createQueryBuilder(
      //   "meeting"
      // )
      //   .select([
      //     "meeting.id",
      //     "meeting.query",
      //     "meeting.feedback",
      //     "meeting.createdDate",
      //     "campaign.id",
      //     "campaign.title",
      //     "investor.company_name",
      //     "investor.first_name",
      //     "investor.last_name",
      //     "investor.id",
      //     "investor.city",
      //     "investor.country",
      //   ])
      //   .innerJoin("meeting.campaign", "campaign")
      //   .innerJoin("meeting.user", "investor")
      //   .innerJoin("campaign.user", "startup")
      //   .innerJoin("startup.tagged", "tagged")
      //   .where("tagged.rm_id = :userId AND tagged.is_active=true", {
      //     userId: user[0].id,
      //   });
      // if (request.query.country) {
      //   campaignQuery.andWhere("investor.country=:country", {
      //     country: request.query.country,
      //   });
      // }
      // if (request.query.from_date && request.query.to_date) {
      //   const formatDate = (date) => {
      //     let convertedDate = new Date(date);
      //     // .toISOString();
      //     // .replace(/T/, " ") // replace T with a space
      //     // .replace(/\..+/, "");
      //     return convertedDate;
      //   };

      //   campaignQuery.andWhere("meeting.createdDate > :start_dates  ", {
      //     start_dates: formatDate(request.query.from_date),
      //   });
      //   campaignQuery.andWhere("meeting.createdDate < :end_date ", {
      //     end_date: formatDate(request.query.to_date),
      //   });
      // }

      // const campaign = await campaignQuery
      //   .skip(
      //     request.query.page
      //       ? Number(request.query.page) *
      //           (request.query.limit ? Number(request.query.limit) : 10)
      //       : 0
      //   )
      //   .take(request.query.limit ? Number(request.query.limit) : 10)
      //   .getManyAndCount();

      // list schedule events in calendly
      const getRmDetails = await axios.get(
        process.env.CALENDLY_BASE_URL +
          "/organizations/" +
          process.env.ORGANIZATION_ID +
          "/invitations?email=" +
          user[0].email_id,
        {
          headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` },
        }
      );
      let eventData = [];
      if (getRmDetails.data.collection.length != 0) {
        const user = getRmDetails.data.collection[0];
        var getNext7Days = new Date();
        getNext7Days.setDate(getNext7Days.getDate() + 7);
        if (user?.status === "accepted") {
          const getScheduleEvents: any = await axios.get(
            process.env.CALENDLY_BASE_URL + "/user_busy_times",

            {
              headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` },
              params: {
                end_time: getNext7Days,
                start_time: new Date(),
                user: user.user,
              },
            }
          );
          const data = await getScheduleEvents.data?.collection
            ?.filter((e) => e.type === "calendly")
            .map(async (e) => {
              if (e.event) {
                const getData = await axios.get(e.event.uri, {
                  headers: {
                    Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
                  },
                });
                // console.log(getData.data);
                e.detailData = getData.data?.resource;
              } else {
                e.detailData = {};
              }
              return e;
            });
          eventData = data;
        }
      } else {
        return responseMessage.responseWithData(false, 400, "No events Found");
      }
      const data = await Promise.all(eventData).then((e) => e);

      return responseMessage.responseWithData(
        true,
        200,
        msg.ListMeetingSuccess,
        {
          // total_count: campaign[1],
          // data: campaign[0],
          events: data,
        }
      );
    } catch (err) {
      console.log(err);

      return responseMessage.responseWithData(
        false,
        400,
        msg.ListMeetingFail,
        err
      );
    }
  }

  async dashboard(request: Request) {
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

      const meetingCount = await this.MeetingRepository.createQueryBuilder(
        "meeting"
      )
        .innerJoin("meeting.campaign", "campaign")
        .innerJoin("meeting.user", "investor")
        .innerJoin("campaign.user", "startup")
        .innerJoin("startup.tagged", "tagged")
        .where("tagged.rm_id = :userId AND tagged.is_active=true", {
          userId: user[0].id,
        })
        .getCount();

      const taggedCount = await this.userRepository
        .createQueryBuilder("startup")
        .innerJoin("startup.tagged", "tagged")
        .where("tagged.rm_id = :id AND tagged.is_active=true", {
          id: user[0].id,
        })
        .getCount();

      const interestedQuery = await this.TaggedRepository.createQueryBuilder(
        "tagged"
      )
        .innerJoin("tagged.StartUp", "startup") // get tagged startup
        .innerJoin("startup.campaign", "campaign") // get campaign details for tagged users
        .innerJoin("campaign.myDeals", "mydeals") // get mydeals
        .innerJoin("mydeals.user", "user")
        .where(
          "tagged.rm_id = :id AND tagged.is_active=true AND user.is_deleted=false",
          {
            id: user[0].id,
          }
        )
        .select(["COUNT(DISTINCT `mydeals`.`user_id`) as count"])
        .getRawOne();

      console.log("interestedQuery", interestedQuery);

      const interestedCount = interestedQuery.count;

      const data = {
        meetingCount: meetingCount,
        taggedCount: taggedCount,
        interestedCount: interestedCount,
      };

      return responseMessage.responseWithData(
        true,
        200,
        msg.ListMeetingSuccess,
        data
      );
    } catch (err) {
      console.log(err);

      return responseMessage.responseWithData(
        false,
        400,
        msg.ListMeetingFail,
        err
      );
    }
  }

  async graph(request: Request) {
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

      const year = request.query.year;

      const graphTagged = await this.userRepository
        .createQueryBuilder("startup")
        .select([
          "YEAR(startup.created_date) as year",
          "MONTH(startup.created_date) as month",
          "COUNT(startup.id) as count",
        ])
        .innerJoin("startup.tagged", "tagged")
        .where(
          "tagged.rm_id = :id AND tagged.is_active=true AND YEAR(startup.created_date)=:year",
          {
            id: user[0].id,
            year: year,
          }
        )
        .groupBy("YEAR(startup.created_date), MONTH(startup.created_date)")
        .getRawMany();

      //@todo: Closed logic need to change

      const closed = await this.userRepository
        .createQueryBuilder("startup")
        .select([
          "YEAR(startup.created_date) as year",
          "MONTH(startup.created_date) as month",
          "COUNT(startup.id) as count",
        ])
        .innerJoin("startup.tagged", "tagged")
        .where(
          "tagged.rm_id = :id AND tagged.is_active=true AND YEAR(startup.created_date)=:year",
          {
            id: user[0].id,
            year: year,
          }
        )
        .groupBy("YEAR(startup.created_date), MONTH(startup.created_date)")
        .getRawMany();

      const data = {
        tagged: graphTagged,
        closed,
      };

      return responseMessage.responseWithData(
        true,
        200,
        msg.ListMeetingSuccess,
        data
      );
    } catch (err) {
      console.log(err);

      return responseMessage.responseWithData(
        false,
        400,
        msg.ListMeetingFail,
        err
      );
    }
  }
}
