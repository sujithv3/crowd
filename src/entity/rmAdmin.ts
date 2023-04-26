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
} from "typeorm";
import { Roles } from "./roles";
import { Location } from "./locations";
import { Tagged } from "./tagged";
import { Taggedsales } from "./taggedSales";
import { TaggedSalesStartup } from "./taggedSalesStartup";

type FILE_LIST = any[];

@Entity()
export class rmAdmin {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column({
  //   length: 100,
  //   type: "varchar",
  // })
  // user_code: string;

  @ManyToOne((type) => Roles)
  @JoinColumn({ name: "role_id", referencedColumnName: "id" })
  role: Roles;

  @Column({
    length: 100,
    type: "varchar",
  })
  profile_id: string;

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
    default: null,
    nullable: true,
  })
  city: string;

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
  state: string;

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

  @OneToMany(() => Tagged, (Tagged) => Tagged.RelationManager)
  tagged: Tagged[];

  @OneToMany(() => Taggedsales, (Taggedsales) => Taggedsales.SalesUser)
  taggedsales: Taggedsales[];

  @OneToMany(() => TaggedSalesStartup, (Taggedsales) => Taggedsales.Sales)
  taggedsalesStartup: TaggedSalesStartup[];

  @CreateDateColumn()
  created_date: Date;

  @Column({ type: "json", nullable: true, default: null })
  sector: FILE_LIST;

  @UpdateDateColumn()
  updated_date: Date;

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
