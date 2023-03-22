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

<<<<<<< HEAD
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
=======
  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
>>>>>>> 564a1957db0db8f279ab8a9bc098c0b6753b61c0
  updatedDate: Date;

  @Column("boolean", { default: true })
  is_active: boolean = true;

  @Column("boolean", { default: true })
  is_deleted: boolean = false;
}
