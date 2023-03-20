import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Staging {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 100,
    type: "varchar",
    unique: true,
  })
  name: string;

  @CreateDateColumn({ default: new Date() })
  createdDate: Date;

  @UpdateDateColumn({ default: new Date() })
  updatedDate: Date;

  @Column("boolean", { default: true })
  is_active: boolean = true;

  @Column("boolean", { default: true })
  is_deleted: boolean = false;
}
