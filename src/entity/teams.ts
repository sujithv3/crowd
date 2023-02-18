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
import { Campaigns } from "./campaigns";

@Entity()
export class Teams {
  @PrimaryGeneratedColumn()
  id: number;

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
    type: "date",
  })
  join_date: Date;

  @Column({
    length: 16,
    type: "varchar",
  })
  contact_number: string;

  @Column({
    type: "text",
  })
  summary: string;

  @Column({
    length: 100,
    type: "varchar",
  })
  linkedin: string;

  @Column({
    length: 100,
    type: "varchar",
  })
  email_id: string;

  @Column({
    length: 100,
    type: "varchar",
  })
  personal_email: string;

  @ManyToOne((type) => Roles)
  @JoinColumn({ name: "team_role_id", referencedColumnName: "id" })
  role: Roles;

  @ManyToOne((type) => Campaigns)
  @JoinColumn({ name: "campaign_id", referencedColumnName: "id" })
  campaign: Campaigns;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column("boolean")
  is_active: boolean;

  @Column("boolean")
  is_deleted: boolean;
}
