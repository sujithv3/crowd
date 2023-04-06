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
