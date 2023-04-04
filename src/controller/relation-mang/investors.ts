import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
// import { rmAdmin } from "../../entity/rmAdmin";
import { Tagged } from "../../entity/tagged";
import { Campaigns } from "../../entity/campaigns";
import { Funds } from "../../entity/funds";
import { Users } from "../../entity/Users";
import { Meeting } from "../../entity/meeting";
import { MyDeals } from "../../entity/mydeals";
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

      const investorList = await this.userRepository
        .createQueryBuilder("investor")
        .where("investor.is_deleted=false AND investor.role_id=2")
        .getMany();

      return responseMessage.responseWithData(
        true,
        200,
        msg.campaignListSuccess,
        investorList
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

      const campaign = await this.userRepository
        .createQueryBuilder("user")
        .innerJoin("user.tagged", "tagged")
        .where(
          "tagged.rm_id = :id AND tagged.is_active=true AND user.is_deleted=false",
          {
            id: user[0].id,
          }
        )
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
      const total_count = await campaign.getCount();
      if (request.query.page && request.query.limit) {
        campaign
          .skip(
            request.query.page
              ? (Number(request.query.page) - 1) *
                  (request.query.limit ? Number(request.query.limit) : 10)
              : 0
          )
          .take(request.query.limit ? Number(request.query.limit) : 10);
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
        .innerJoinAndSelect("fund.campaign", "campaign")
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
          "campaign.title",
          "location.name",
          "location.country",
          "fund.fund_amount",
        ]);
      const total_count = await campaign.getCount();
      if (request.query.page && request.query.limit) {
        campaign
          .skip(
            request.query.page
              ? (Number(request.query.page) - 1) *
                  (request.query.limit ? Number(request.query.limit) : 10)
              : 0
          )
          .take(request.query.limit ? Number(request.query.limit) : 10);
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
          .skip(
            request.query.page
              ? (Number(request.query.page) - 1) *
                  (request.query.limit ? Number(request.query.limit) : 10)
              : 0
          )
          .take(request.query.limit ? Number(request.query.limit) : 10);
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

      const campaign = await this.MeetingRepository.createQueryBuilder(
        "meeting"
      )
        .select([
          "meeting.id",
          "meeting.query",
          "meeting.feedback",
          "meeting.createdDate",
          "campaign.id",
          "campaign.title",
          "investor.company_name",
          "investor.id",
          "investor.city",
          "investor.country",
        ])
        .innerJoin("meeting.campaign", "campaign")
        .innerJoin("meeting.user", "investor")
        .innerJoin("campaign.user", "startup")
        .innerJoin("startup.tagged", "tagged")
        .where("tagged.rm_id = :userId AND tagged.is_active=true", {
          userId: user[0].id,
        })
        .getMany();

      return responseMessage.responseWithData(
        true,
        200,
        msg.ListMeetingSuccess,
        campaign
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

      const interestedCount = await this.MyDealsRepository.createQueryBuilder(
        "mydeals"
      )
        .innerJoin("mydeals.user", "investor")
        .innerJoin("investor.tagged", "tagged")
        .where("tagged.rm_id = :id AND tagged.is_active=true", {
          id: user[0].id,
        })
        .getCount();

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
