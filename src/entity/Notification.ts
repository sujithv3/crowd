import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { Funds } from "./funds";
import { Users } from "./Users";

export enum NotificationType {
  BUSINESS = "business",
  INDIVIDUAL = "individual",
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "enum",
    enum: NotificationType,
    default: NotificationType.BUSINESS,
  })
  type: NotificationType;

  @Column({
    length: 100,
    type: "varchar",
  })
  title: string;

  @Column({
    length: 200,
    type: "varchar",
  })
  info: string;

  @ManyToOne(() => Users, (user) => user.id)
  user: Users;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column("boolean")
  is_active: boolean;

  @Column("boolean")
  is_deleted: boolean;
}
