import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { Campaigns, CAMPAIGN_STATUS } from "../../entity/campaigns";
const responseMessage = require("../../configs/response");
const msg = require("../../configs/message");
const Jwt = require("../../utils/jsonwebtoken");
const Stripe = require("stripe");

export class SubscriptionController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  //   subscription create
  async createSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      // find user
      let token: any;
      if (
        typeof req.cookies.token === "undefined" ||
        req.cookies.token === null
      ) {
        if (!req.headers.authorization) {
          return res
            .status(412)
            .send(
              responseMessage.responseMessage(
                false,
                402,
                msg.user_login_required
              )
            );
        } else {
          token = req.headers.authorization.slice(7);
        }
      } else {
        token = req.cookies.token;
      }

      const user = Jwt.decode(token);

      const customer = await this.stripe.customers.create({
        email: user[0].email_id,
        name: user[0].first_name + " " + user[0].last_name,
      });
      console.log(customer);

      // create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customer?.id,
        items: [
          {
            price: req.body.priceId,
          },
        ],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
      });
      console.log(subscription);

      res.status(200).send({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      });
    } catch (error) {
      return res.status(400).send({ error: { message: error.message } });
    }
  }

  // list approve campaign
  //   async approve(req: Request, res: Response, next: NextFunction) {
  //     const id = parseInt(req.params.id);
  //     try {
  //       const campaign = await this.campaignRepository
  //         .createQueryBuilder()
  //         .where("id=:id", { id })
  //         .getOne();

  //       if (!campaign) {
  //         return responseMessage.responseWithData(
  //           false,
  //           400,
  //           "campaign not found",
  //           campaign
  //         );
  //       }

  //       await this.campaignRepository
  //         .createQueryBuilder()
  //         .update(Campaigns)
  //         .set({ status: CAMPAIGN_STATUS.Approved })
  //         .where("id=:id", { id })
  //         .execute();

  //       return responseMessage.responseMessage(true, 200, msg.approved_success);
  //     } catch (error) {
  //       console.log(error);
  //       return responseMessage.responseWithData(
  //         false,
  //         400,
  //         msg.approved_failed,
  //         error
  //       );
  //     }
  //   }
}
