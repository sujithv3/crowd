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
import { Campaigns } from "./campaigns";

@Entity()
export class BankInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 100,
    type: "varchar",
  })
  transit_number: string;

  @Column({
    length: 100,
    type: "varchar",
  })
  bank_name: string;

  @Column({
    length: 100,
    type: "varchar",
  })
  finance_number: string;

  @Column({
    length: 100,
    type: "varchar",
  })
  account_number: string;

  @Column({
    length: 100,
    type: "varchar",
  })
  swift: string;

  @Column({
    length: 100,
    type: "varchar",
  })
  bank_location: string;

  @Column({
    length: 100,
    type: "varchar",
  })
  bank_address: string;

  @ManyToOne((type) => Campaigns)
  @JoinColumn({ name: "campaign_id", referencedColumnName: "id" })
  campaign: Campaigns;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column("boolean")
  is_active: boolean;

  @Column("boolean")
  is_deleted: boolean;
}
