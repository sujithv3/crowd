import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Tree,
  TreeChildren,
  TreeParent,
  TreeLevelColumn,
} from "typeorm";
import { Users } from "./Users";
import { Campaigns } from "./campaigns";

@Entity()
@Tree("materialized-path")
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 100,
    type: "varchar",
  })
  name: string;

  @Column({
    type: "int",
  })
  parent_id: number;

  @TreeChildren()
  children: Category[];

  @TreeParent()
  parent: Category;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column("boolean")
  is_active: boolean;

  @Column("boolean")
  is_deleted: boolean;
}
