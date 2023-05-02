import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from "typeorm";

import { Countries } from "./countries";
import { States } from "./states";



@Entity()
export class Cities {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "varchar",
        default: null,
    })
    name: string;

    @ManyToOne((type) => States)
    @JoinColumn({ name: "state_id", referencedColumnName: "id" })
    state_id: string;


    @ManyToOne((type) => Countries)
    @JoinColumn({ name: "country_id", referencedColumnName: "id" })
    country_id: string;

    @Column({
        type: "varchar",
        default: null,
    })
    state_code: string;



    @Column({
        length: 2,
        type: "char",
        default: null,
    })
    country_code: string;


    @Column({
        type: "decimal",
        precision: 10,
        scale: 8,
        default: null,
    })
    latitude: string;

    @Column({
        type: "decimal",
        precision: 11,
        scale: 8,
        default: null,
    })
    longitude: string;


    @Column({
        type: "tinyint",
        default: null,
    })
    flag: string;

    @Column({
        type: "varchar",
        default: null,
    })
    wikiDataId: string;

    @CreateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
    })
    created_at: Date;

    @UpdateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
        onUpdate: "CURRENT_TIMESTAMP(6)",
    })
    updated_at: Date;
}
