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
const Campaign = require("./routes/start-up/campaigns");

const client = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.ACCOUNT_AUTH_TOKEN
);

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

// send sms

// client.verify.v2
//   .services("VA62653ec25298359e3368a66c659759d7")
//   .verifications.create({ to: "+916383451170", channel: "sms" })
//   .then((verification) => console.log(verification.status));

// client.verify.v2
//   .services("VA62653ec25298359e3368a66c659759d7")
//   .verificationChecks.create({ to: "+916383451170", code: "792104" })
//   .then((verification_check) => console.log(verification_check.status));

// routes
app.use("/api/user", user);
app.use("/api/role", role);
app.use("/api/category", category);
app.use("/api/location", location);
app.use("/api/start-up/campaign/start-up", startUp);
app.use("/api/start-up/campaign/basic-info", BasicInfo);
app.use("/api/start-up/campaign/project-detail", ProjectDetail);
app.use("/api/start-up/campaign/team", Team);
app.use("/api/start-up/campaign/fund", Fund);
app.use("/api/start-up/campaign/payment-verification", PaymentVerification);
app.use("/api/start-up/campaign/bank", BankDetail);
app.use("/api/start-up/campaign", Campaign);
