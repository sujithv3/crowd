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

  @ManyToOne((type) => Users, (Users) => Users.tagged)
  @JoinColumn({ name: "start_up_id", referencedColumnName: "id" })
  StartUp: Users;

  @ManyToOne((type) => rmAdmin, (campaign) => campaign.tagged)
  @JoinColumn({ name: "rm_id", referencedColumnName: "id" })
  RelationManager: rmAdmin;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column("boolean", { default: true })
  is_active: boolean = true;

  @Column("boolean", { default: false })
  is_deleted: boolean = false;
}
