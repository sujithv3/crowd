import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from "typeorm";
import { Roles } from "./roles";
import { Cities } from "./cities";
import { Location } from "./locations";
import { Campaigns } from "./campaigns";
import { Tagged } from "./tagged";
import { Funds } from "./funds";
import { ChatOnline } from "./chatOnline";
import { TaggedSalesStartup } from "./taggedSalesStartup";
import { LegalStatusStartup } from "./legalStatusStartup";
import { LegalStatusInvestor } from "./legalStatusInvestor";

type FILE_LIST = { name: number; value: any }[];

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Index("user_code_index")
  @Column({
    length: 100,
    default: null,
    nullable: true,
    type: "varchar",
  })
  user_code: string;

  @ManyToOne((type) => Roles)
  @JoinColumn({ name: "role_id", referencedColumnName: "id" })
  role: Roles;

  @Column({ type: "json", nullable: true, default: null })
  files: FILE_LIST;

  @Column({
    length: 100,
    type: "varchar",
  })
  first_name: string;

  @Column({
    length: 100,
    type: "varchar",
  })
  last_name: string;

  @Column({
    length: 100,
    type: "varchar",
  })
  email_id: string;

  @Column({
    length: 16,
    type: "varchar",
    nullable: true,
  })
  contact_number: string;

  @Column({
    length: 250,
    type: "varchar",
    nullable: true,
  })
  profile: string;

  @Column({
    length: 250,
    type: "varchar",
    nullable: true,
  })
  company_logo: string;

  @Column({
    length: 250,
    type: "varchar",
    nullable: true,
  })
  street_name: string;

  @ManyToOne((type) => Cities)
  @JoinColumn({ name: "city_id", referencedColumnName: "id" })
  city: Cities;

  // @Column({
  //   length: 250,
  //   type: "varchar",
  //   default: null,
  //   nullable: true,
  // })
  // city: string;

  @Column({
    length: 100,
    type: "varchar",
    nullable: true,
  })
  country: string;

  @Column({
    length: 100,
    type: "varchar",
    nullable: true,
  })
  code: string;

  @Column({
    length: 250,
    type: "varchar",
    nullable: true,
  })
  description: string;

  @Column({
    length: 2000,
    type: "varchar",
    nullable: true,
  })
  summary: string;

  @Column({
    length: 250,
    type: "varchar",
    nullable: true,
  })
  linked_in: string;

  @Column({
    length: 250,
    type: "varchar",
    nullable: true,
  })
  facebook: string;

  @Column({
    length: 250,
    type: "varchar",
    nullable: true,
  })
  twitter: string;

  @Column({
    length: 250,
    type: "varchar",
    nullable: true,
  })
  you_tube: string;

  @Column({
    length: 250,
    type: "varchar",
    nullable: true,
  })
  website: string;

  @Column({
    type: "json",
    default: null,
  })
  extra_links!: Array<{ name: string; url: string }>;

  @Column({
    length: 100,
    type: "varchar",
  })
  password: string;

  @Column({
    length: 100,
    type: "varchar",
    default: null,
  })
  email_otp: string;

  @Column({
    length: 100,
    type: "varchar",
    nullable: true,
  })
  deactivate_reason: string;

  @Column({
    length: 300,
    type: "varchar",
    nullable: true,
    default: null,
  })
  company_name: string;

  @Column({
    length: 250,
    type: "varchar",
    nullable: true,
    default: null,
  })
  stage_of_business: string;

  @Column({ type: "json", nullable: true, default: null })
  sector: FILE_LIST;

  @OneToMany(() => Campaigns, (Campaigns) => Campaigns.user)
  campaign: Campaigns[];

  @OneToMany(() => Funds, (funds) => funds.investor)
  investor: Funds[];

  @OneToMany(() => Tagged, (Tagged) => Tagged.StartUp)
  tagged: Tagged[];

  @OneToMany(() => Funds, (Funds) => Funds.investor)
  fund: Funds[];

  @OneToMany(() => ChatOnline, (Funds) => Funds.user)
  online: ChatOnline[];

  @OneToMany(() => TaggedSalesStartup, (TaggedSalesStartup) => TaggedSalesStartup.StartUp)
  taggedSalesStartup: TaggedSalesStartup[];

  @OneToOne(() => LegalStatusStartup, (legalStatusStartup) => legalStatusStartup.User)
  legalStatusStartup: LegalStatusStartup[];

  @OneToOne(() => LegalStatusInvestor, (legalStatusInvestor) => legalStatusInvestor.User)
  legalStatusInvestor: LegalStatusInvestor[];

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;

  // Subscribed to newsletter (To avoid spam messages, we have to provide this column)
  @Column({ default: true })
  subscribed: boolean;

  @Column("boolean")
  is_active: boolean;

  @Column({
    default: false,
  })
  is_deleted: boolean;

  @Column({
    default: false,
  })
  is_verify: boolean;

  @Column({
    default: false,
  })
  contact_number_verified: boolean;
}
