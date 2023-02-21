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

export enum businessType {
  BUSINESS = "business",
  INDIVIDUAL = "individual",
}

type FILE_LIST = { name: number; type: string; url: string }[];

@Entity()
export class Campaigns {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 100,
    type: "varchar",
  })
  title: string;

  @Column({
    length: 100,
    type: "varchar",
  })
  tag_line: string;

  @Column({
    length: 100,
    type: "varchar",
  })
  location: string;

  @Column({
    length: 5,
    type: "varchar",
  })
  currency: string;

  @Column({
    type: "float",
  })
  tax: number;

  @Column({
    length: 150,
    type: "varchar",
  })
  project_image: string;

  @Column({
    length: 150,
    type: "varchar",
  })
  project_video: string;

  @Column({
    length: 150,
    type: "varchar",
  })
  demo_url: string;

  @Column({
    type: "text",
  })
  description: string;

  @Column({
    type: "text",
  })
  challenges: string;

  @Column({
    type: "text",
  })
  faq: string;

  @ManyToOne(() => Users, (user) => user.id)
  user: Users;

  @ManyToOne(() => Users, (user) => user.id)
  manager: Users;

  @Column({ type: "json" })
  files: FILE_LIST;

  @Column({
    type: "enum",
    enum: businessType,
    default: businessType.BUSINESS,
  })
  format: businessType;

  @ManyToOne((type) => Category)
  @JoinColumn({ name: "category_id", referencedColumnName: "id" })
  category: Category;

  @ManyToOne((type) => Category)
  @JoinColumn({ name: "sub_category_id", referencedColumnName: "id" })
  subcategory: Category;

  @OneToMany(() => Funds, (fund) => fund.campaign)
  fund: Funds[];

  @Column({
    type: "float",
  })
  goal_amount: number;

  @Column({
    type: "float",
  })
  min_invest: number;

  @Column({
    type: "float",
  })
  max_invest: number;

  @Column({
    length: 50,
    type: "varchar",
  })
  deal_size: string;

  @Column({
    type: "float",
  })
  raised_fund: number;

  @Column({ type: "datetime" }) // Recommended
  start_date: Date;

  @Column({ type: "datetime" }) // Recommended
  end_date: Date;

  @Column("boolean")
  is_featured: boolean;

  @Column({
    length: 50,
    type: "varchar",
  })
  status: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column("boolean")
  is_active: boolean;

  @Column({
    default: false,
  })
  is_deleted: boolean;
}
