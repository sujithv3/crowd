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

@Entity()
export class MyDeals {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => Users)
  @JoinColumn({ name: "user_id", referencedColumnName: "id" })
  user: Users;

  @ManyToOne((type) => Campaigns, (campaign) => campaign.myDeals)
  @JoinColumn({ name: "campaign_id", referencedColumnName: "id" })
  campaign: Campaigns;

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
