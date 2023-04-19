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
import { Location } from "./entity/locations";
import { Staging } from "./entity/staging";
import { rmAdmin } from "./entity/rmAdmin";
import { rmForgetToken } from "./entity/rmforget-password-token";
import { MyDeals } from "./entity/mydeals";
import { Meeting } from "./entity/meeting";
import { Tagged } from "./entity/tagged";
import { Cms } from "./entity/cms";
import { NewsletterEmail } from "./entity/newsletter-email";
import { Taggedsales } from "./entity/taggedSales";
import { TaggedSalesStartup } from "./entity/taggedSalesStartup";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DATABASE_URL,
  port: 3306,
  username: process.env.DATABASE_USER_NAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  logging: false,
  synchronize: true,
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
    Location,
    Staging,
    rmAdmin,
    rmForgetToken,
    MyDeals,
    Meeting,
    Tagged,
    Cms,
    NewsletterEmail,
    Taggedsales,
    TaggedSalesStartup,
  ],
  migrations: ["migration/*.ts"],
  subscribers: [],
});
