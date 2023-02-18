import "reflect-metadata";
import { DataSource } from "typeorm";
import { Users } from "./entity/Users";
import { Roles } from "./entity/roles";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "Admin@35",
  database: "CROWD_FUNDING_TEST",
  synchronize: false,
  logging: false,
  entities: [Users, Roles],
  migrations: [],
  subscribers: [],
});
