const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config({ path: __dirname + "/.env" });
import { AppDataSource } from "./data-source";
const user = require("./routes/user");
const role = require("./routes/role");

// mysql database connection initialize

AppDataSource.initialize()
  .then(async () => {
    console.log("MySql is Connected");
  })
  .catch((error) => console.log("mysql", error));

// create express app
const app = express();
app.use(cors());
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
