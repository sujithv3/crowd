import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Users } from "./Users";
import { Campaigns } from "./campaigns";
import { Meeting } from "./meeting";

@Entity()
export class Funds {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (Users) => Users.fund)
  @JoinColumn()
  investor: Users;

  @Column({
    type: "float",
  })
  fund_amount: number;

  @ManyToOne(() => Campaigns, (campaign) => campaign.fund)
  campaign: Campaigns;

  @Column({
    type: "date",
    default: null,
  })
  expected_invest_date: Date;

  @Column({
    type: "text",
    default: null,
  })
  remark: string;

  @Column({
    default: false,
  })
  req_meeting: boolean;

  @ManyToOne(() => Meeting, (meeting) => meeting.id)
  @JoinColumn({ name: "meeting_id", referencedColumnName: "id" })
  meeting: Meeting;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column("boolean")
  is_active: boolean;

  @Column("boolean")
  is_deleted: boolean;
}
