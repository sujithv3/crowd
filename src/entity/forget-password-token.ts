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
import { Users } from "./Users";

@Entity()
export class ForgetToken {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => Users)
  @JoinColumn()
  user: Users;

  @Column({
    length: 400,
    type: "varchar",
  })
  token: string;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;
}
