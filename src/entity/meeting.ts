import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Users } from "./Users";
import { Campaigns } from "./campaigns";
import { rmAdmin } from "./rmAdmin";

export enum status {
  APPROVED = "approved",
  PENDING = "pending",
}

@Entity()
export class Meeting {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => Users)
  @JoinColumn({ name: "user_id", referencedColumnName: "id" })
  user: Users;

  @ManyToOne((type) => Campaigns, (campaign) => campaign.myDeals)
  @JoinColumn({ name: "campaign_id", referencedColumnName: "id" })
  campaign: Campaigns;

  @ManyToOne(
    (type) => rmAdmin,
    (Relationship_manager) => Relationship_manager.meeting
  )
  @JoinColumn({ name: "rm_id", referencedColumnName: "id" })
  Relationship_manager: Campaigns;

  @Column({ type: "json", nullable: true, default: null })
  location: any[];

  @Column({
    length: 200,
    type: "varchar",
    default: null,
  })
  name: string;

  @Column({
    length: 700,
    type: "varchar",
    default: null,
  })
  url: string;

  @Column({
    length: 200,
    type: "varchar",
    default: null,
  })
  query: string;

  @Column({
    type: "text",
    default: null,
  })
  feedback: string;

  @Column({
    type: "enum",
    enum: status,
    default: status.PENDING,
  })
  status: status;

  @CreateDateColumn({
    type: "timestamp",
    default: null,
  })
  meeting_date: Date;

  @CreateDateColumn({
    type: "timestamp",
    default: null,
  })
  start_time: Date;

  @CreateDateColumn({
    type: "timestamp",
    default: null,
  })
  end_time: Date;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createdDate: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  updatedDate: Date;

  @Column("boolean", { default: true })
  is_active: boolean = true;

  @Column("boolean", { default: false })
  is_deleted: boolean = false;
}
