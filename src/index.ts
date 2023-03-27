const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config({ path: __dirname + "/.env" });
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
const mydeals = require("./routes/mydeals");
const dashBoard = require("./routes/admin/dashboard");

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
app.use("/api/relation-mang", rmAdmin);
app.use("/api/seed", seed);
app.use("/api/mydeals", mydeals);
app.use("/api/admin", dashBoard);
