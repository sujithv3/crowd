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

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => Roles)
  @JoinColumn({ name: "role_id", referencedColumnName: "id" })
  role: Roles;

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

  @Column({
    length: 100,
    type: "varchar",
    nullable: true,
  })
  country: string;

  @Column({
    length: 250,
    type: "varchar",
    nullable: true,
  })
  description: string;

  @Column({
    length: 500,
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
    array: false,
    nullable: false,
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
    nullable: true,
  })
  deactivate_reason: string;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;

  @Column("boolean")
  is_active: boolean;

  @Column({
    default: false,
  })
  is_deleted: boolean;
}
