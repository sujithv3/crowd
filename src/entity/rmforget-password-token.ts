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
import { rmAdmin } from "./rmAdmin";

@Entity()
export class rmForgetToken {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => rmAdmin)
  @JoinColumn()
  user: rmAdmin;

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
