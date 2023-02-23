import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 100,
    type: "varchar",
  })
  name: string;

  @Column({
    length: 100,
    type: "varchar",
  })
  location_type: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column("boolean")
  is_active: boolean;

  @Column("boolean")
  is_deleted: boolean;
}
