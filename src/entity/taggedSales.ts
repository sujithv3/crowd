import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { rmAdmin } from "./rmAdmin";

@Entity()
export class Taggedsales {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => rmAdmin, (Sales) => Sales.taggedsales)
  @JoinColumn({ name: "sales_id", referencedColumnName: "id" })
  SalesUser: rmAdmin;

  @ManyToOne((type) => rmAdmin, (campaign) => campaign.taggedsales)
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
