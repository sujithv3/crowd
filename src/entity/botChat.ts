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
  
  @Entity()
  export class botChat {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({
      length: 100,
      type: "varchar",
    })
    qus_category: string;
  
    @Column({
      length: 100,
      type: "varchar",
    })
    qus_sub_category: string;
  
    @Column({
      length: 100,
      type: "varchar",
    })
    qus_type: string;
  
    @Column({
      type: "text",
    })
    qustions: string;
  
    @Column({
      type: "text",
    })
    answers: string;
  
    @CreateDateColumn()
    created_date: Date;
  
    @UpdateDateColumn()
    updated_date: Date;
  
    @Column("boolean")
    is_active: boolean;
  
    @Column({
      default: false,
    })
    is_deleted: boolean;
  
  }
  