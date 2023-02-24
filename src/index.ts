const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config({ path: __dirname + "/.env" });
import { AppDataSource } from "./data-source";
const user = require("./routes/user");
const role = require("./routes/role");
const campaigns = require("./routes/campaigns");
const category = require("./routes/category");
const location = require("./routes/location");
const startUp = require("./routes/start-up/campaigns/start-up");
const BasicInfo = require("./routes/start-up/campaigns/basic-info");

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
app.use("/api/campaigns", campaigns);
app.use("/api/category", category);
app.use("/api/location", location);
app.use("/api/start-up/campaign/start-up", startUp);
app.use("/api/start-up/campaign/basic-info", BasicInfo);
