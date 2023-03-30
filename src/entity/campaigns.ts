import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { Funds } from "./funds";
import { Users } from "./Users";
import { Category } from "./category";
import { Location } from "./locations";
import { Teams } from "./teams";
import { BankInfo } from "./bankinfo";
import { Staging } from "./staging";
import { MyDeals } from "./mydeals";

export enum businessType {
  BUSINESS = "business",
  INDIVIDUAL = "individual",
}

type FILE_LIST = { name: number; value: any }[];

@Entity()
export class Campaigns {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Location, (user) => user.id)
  @JoinColumn({ name: "tax_location_id", referencedColumnName: "id" })
  tax_location: Location;

  @ManyToOne(() => Location, (user) => user.id)
  @JoinColumn({ name: "bank_location_id", referencedColumnName: "id" })
  bank_location: Location;

  @Column({
    length: 100,
    type: "varchar",
    default: null,
  })
  title: string;

  @Column({
    length: 100,
    type: "varchar",
    default: null,
  })
  tag_line: string;

  @ManyToOne(() => Location, (user) => user.id)
  @JoinColumn({ name: "project_location_id", referencedColumnName: "id" })
  location: Location;

  @Column({
    length: 100,
    type: "varchar",
    default: null,
  })
  tag: string;

  @Column({
    length: 5,
    type: "varchar",
    default: null,
  })
  currency: string;

  @Column({
    type: "float",
    default: 0,
  })
  tax: number;

  @Column({
    length: 150,
    type: "varchar",
    default: null,
  })
  project_image: string;

  @Column({
    length: 150,
    type: "varchar",
    default: null,
  })
  project_video: string;

  @Column({
    length: 150,
    type: "varchar",
    default: null,
  })
  demo_url: string;

  @Column({
    type: "text",
    default: null,
  })
  description: string;

  @Column({
    type: "text",
    default: null,
  })
  challenges: string;

  @Column({
    type: "json",
    default: null,
    nullable: true,
  })
  faq!: Array<{ question: string; answer: string }>;

  @ManyToOne(() => Users, (Users) => Users.campaign)
  @JoinColumn({ name: "user_id", referencedColumnName: "id" })
  user: Users;

  @ManyToOne((type) => Staging)
  @JoinColumn({ name: "staging_id", referencedColumnName: "id" })
  staging: Staging;

  @ManyToOne((type) => Users)
  @JoinColumn({ name: "manager_id", referencedColumnName: "id" })
  manager: Users;

  @Column({ type: "json" })
  files: FILE_LIST;

  @Column({
    type: "enum",
    enum: businessType,
    default: businessType.BUSINESS,
  })
  business_type: businessType;

  @ManyToOne((type) => Category)
  @JoinColumn({ name: "primary_category", referencedColumnName: "id" })
  primary_category: Category;

  @ManyToOne((type) => Category)
  @JoinColumn({ name: "primary_sub_category", referencedColumnName: "id" })
  primary_sub_category: Category;

  @ManyToOne((type) => Category)
  @JoinColumn({ name: "category_id", referencedColumnName: "id" })
  category: Category;

  @ManyToOne((type) => Category)
  @JoinColumn({ name: "sub_category_id", referencedColumnName: "id" })
  subcategory: Category;

  @OneToMany(() => Funds, (fund) => fund.campaign)
  fund: Funds[];

  @OneToMany(() => Teams, (team) => team.campaign)
  team: Teams[];

  @OneToMany(() => BankInfo, (bank) => bank.campaign)
  bank: BankInfo[];

  @OneToMany(() => MyDeals, (myDeal) => myDeal.campaign)
  myDeals: MyDeals[];

  @Column({
    type: "float",
    default: null,
    nullable: true,
  })
  goal_amount: number;

  @Column({
    type: "float",
    default: null,
    nullable: true,
  })
  min_invest: number;

  @Column({
    type: "float",
    default: null,
    nullable: true,
  })
  max_invest: number;

  @Column({
    length: 50,
    type: "varchar",
    default: null,
    nullable: true,
  })
  deal_size: string;

  @Column({
    length: 250,
    type: "varchar",
    default: null,
  })
  fund_document: string;

  @Column({
    length: 250,
    type: "varchar",
    default: null,
  })
  duration: string;

  @Column({
    length: 250,
    type: "varchar",
    default: null,
  })
  contact_number: string;

  @Column({
    type: "float",
    default: null,
    nullable: true,
  })
  raised_fund: number;

  @Column({
    type: "datetime",
    default: null,
  })
  raised_fund_date: Date;

  @Column({ type: "datetime", nullable: true }) // Recommended
  start_date: Date;

  @Column({ type: "datetime", nullable: true }) // Recommended
  end_date: Date;

  @Column({ default: false })
  is_featured: boolean;

  @Column({
    length: 250,
    type: "varchar",
    default: null,
  })
  contact_email_id: string;

  @Column({
    length: 50,
    type: "varchar",
    default: "Not Approved",
    nullable: true,
  })
  status: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column({
    default: true,
  })
  is_active: boolean;

  @Column({
    default: false,
  })
  is_deleted: boolean;

  @Column({
    default: false,
  })
  is_published: boolean;
}
