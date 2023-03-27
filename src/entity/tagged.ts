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
import { rmAdmin } from "./rmAdmin";

@Entity()
export class Tagged {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => Users)
  @JoinColumn({ name: "start_up_id", referencedColumnName: "id" })
  StartUp: Users;

  @ManyToOne((type) => rmAdmin, (campaign) => campaign.tagged)
  @JoinColumn({ name: "rm_id", referencedColumnName: "id" })
  RelationManager: rmAdmin;

  @CreateDateColumn({
    type: "date",
    default: new Date(),
  })
  createdDate: Date;

  @UpdateDateColumn({
    type: "date",
    default: new Date(),
  })
  updatedDate: Date;

  @Column("boolean", { default: true })
  is_active: boolean = true;

  @Column("boolean", { default: false })
  is_deleted: boolean = false;
}
