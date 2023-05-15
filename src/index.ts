const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config({ path: __dirname + "/../.env" });
import { AppDataSource } from "./data-source";
const user = require("./routes/user");
const role = require("./routes/role");
const category = require("./routes/category");
const location = require("./routes/location");
const startUp = require("./routes/start-up/campaigns/start-up");
const BasicInfo = require("./routes/start-up/campaigns/basic-info");
const ProjectDetail = require("./routes/start-up/campaigns/project-details");
const Team = require("./routes/start-up/campaigns/team");
const Fund = require("./routes/start-up/campaigns/funds");
const PaymentVerification = require("./routes/start-up/campaigns/payment-verification");
const BankDetail = require("./routes/start-up/campaigns/bank");
const startupCampaign = require("./routes/start-up/campaigns");
const Campaign = require("./routes/campaign");
const Investor = require("./routes/investor");
const staging = require("./routes/staging");
const seed = require("./routes/seed");
const rmAdmin = require("./routes/relation-mang/rmAdmin");
const rmTagged = require("./routes/relation-mang/tagged");
const rmInvestor = require("./routes/relation-mang/investors");
const rmSales = require("./routes/relation-mang/salesAssign");
const mydeals = require("./routes/mydeals");
const dashBoard = require("./routes/admin/dashboard");
const StartUpAdmin = require("./routes/admin/startup");
const InvestorAdmin = require("./routes/admin/investor");
const CampaignAdmin = require("./routes/admin/campaign");
const RmAdmin = require("./routes/admin/rm");
const AdminTagged = require("./routes/admin/tagged");
const Meeting = require("./routes/meeting");
const AdminUser = require("./routes/admin/user");
const Sales = require("./routes/sales/salesCreate");
const SalesList = require("./routes/sales/salesList");
const SalesTagged = require("./routes/sales/tagged");
const SalesStartup = require("./routes/sales/startUp");
const SalesStartupTag = require("./routes/relation-mang/salesAssignTag");
const HomePageEditTemplates = require('./routes/homePageTemplates')
const payment = require("./routes/payment");
const data = require("./routes/payment");
const chat = require("./routes/chat/chatApi");
const chatHook = require("./routes/chat/chatHooks");
import "./cron";

// mysql database connection initialize

AppDataSource.initialize()
  .then(async () => {
    console.log("MySql is Connected");
  })
  .catch((error) => console.log("mysql", error));

// create express app
const app = express();
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// start express server

app.listen(process.env.SERVER_URL, () => {
  console.log(`server is started ${process.env.SERVER_URL}`);
});

// routes
app.use("/api", payment);
app.use("/api/user", user);
app.use("/api/role", role);
app.use("/api/category", category);
app.use("/api/staging", staging);
app.use("/api/location", location);
app.use("/api/campaign", Campaign);
app.use("/api/start-up/campaign/start-up", startUp);
app.use("/api/start-up/campaign/basic-info", BasicInfo);
app.use("/api/start-up/campaign/project-detail", ProjectDetail);
app.use("/api/start-up/campaign/team", Team);
app.use("/api/start-up/campaign/fund", Fund);
app.use("/api/start-up/campaign/payment-verification", PaymentVerification);
app.use("/api/start-up/campaign/bank", BankDetail);
app.use("/api/start-up/campaign", startupCampaign);
app.use("/api/investor", Investor);
app.use("/api/relation-mang/tagged", rmTagged);
app.use("/api/relation-mang/investor", rmInvestor);
app.use("/api/relation-mang", rmAdmin);
app.use("/api/relation-mang/sales", rmSales);
app.use("/api/seed", seed);
app.use("/api/mydeals", mydeals);
app.use("/api/meeting", Meeting);
app.use("/api/admin", dashBoard);
app.use("/api/admin", StartUpAdmin);
app.use("/api/admin/investor", InvestorAdmin);
app.use("/api/admin/campaign", CampaignAdmin);
app.use("/api/admin/rm", RmAdmin);
app.use("/api/admin/tag", AdminTagged);
app.use("/api/admin/user", AdminUser);
app.use("/api/sales", Sales);
app.use("/api/sales-list", SalesList);
app.use("/api/sales/tag", SalesTagged);
app.use("/api/sales/startup", SalesStartup);
app.use("/api/sales/startup-tag",SalesStartupTag);
app.use("/api/homepage",HomePageEditTemplates);
app.use("/api/sales/startup-tag", SalesStartupTag);
app.use("/api/chat", chat);
app.use("/api/chat-hooks", chatHook);

// payment webhooks
const Stripe = require("stripe");

const stripe = new Stripe(
  "sk_test_51MyTbnSHygDnzMTz8wqlnzreImLjrwCfRyWPxjmCEkjS0Kq3TKUXg6P8zOsGNyPIHh4GeGsIwmN2hTw56KdtvUOo00V1GymlYX"
);

app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("req", req);
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(err);
      console.log(`⚠️  Webhook signature verification failed.`);
      console.log(
        `⚠️  Check the env file and enter the correct webhook secret.`
      );
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    const dataObject = event.data.object;

    // Handle the event
    // Review important events for Billing webhooks
    // https://stripe.com/docs/billing/webhooks
    // Remove comment to see the various objects sent for this sample
    switch (event.type) {
      case "invoice.paid":
        // Used to provision services after the trial has ended.
        // The status of the invoice will show up as paid. Store the status in your
        // database to reference when a user accesses your service to avoid hitting rate limits.
        break;
      case "invoice.payment_failed":
        // If the payment fails or the customer does not have a valid payment method,
        //  an invoice.payment_failed event is sent, the subscription becomes past_due.
        // Use this webhook to notify your user that their payment has
        // failed and to retrieve new card details.
        break;
      case "customer.subscription.deleted":
        if (event.request != null) {
          // handle a subscription canceled by your request
          // from above.
        } else {
          // handle subscription canceled automatically based
          // upon your subscription settings.
        }
        break;
      default:
      // Unexpected event type
    }
    res.sendStatus(200);
  }
);
