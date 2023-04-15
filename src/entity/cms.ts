import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum TYPE {
  MAIL = "MAIL",
  CONTENT = "CONTENT",
  MAIL_TEMPLATE = "MAIL TEMPLATE",
}

@Entity()
export class Cms {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 150,
    type: "varchar",
    default: null,
  })
  title: string;

  @Column({
    length: 70,
    type: "varchar",
    default: null,
    unique: true,
  })
  tag: string;

  @Column({
    type: "text",
    default: null,
  })
  content: string;

  @Column({
    type: "text",
    default: null,
  })
  variables: string;

  @Column({
    type: "enum",
    enum: TYPE,
    default: TYPE.CONTENT,
  })
  type: TYPE;

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
  updatedDate: Date;
}
