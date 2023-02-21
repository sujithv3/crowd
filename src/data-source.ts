import "reflect-metadata";
import { DataSource } from "typeorm";
import { Users } from "./entity/Users";
import { Roles } from "./entity/roles";
import { ForgetToken } from "./entity/forget-password-token";
import { Notification } from "./entity/Notification";
import { Teams } from "./entity/teams";
import { Funds } from "./entity/funds";
import { Category } from "./entity/category";
import { Campaigns } from "./entity/campaigns";
import { BankInfo } from "./entity/bankinfo";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "Admin@35",
  database: "CROWD_FUNDING_TEST",
  logging: false,
  synchronize: false,
  dropSchema: false,
  entities: [
    Users,
    Roles,
    ForgetToken,
    Notification,
    Teams,
    Funds,
    Category,
    Campaigns,
    BankInfo,
  ],
  migrations: ["migration/*.ts"],
  subscribers: [],
});
