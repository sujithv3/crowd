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

@Entity()
export class States {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "varchar",
        default: null,
    })
    name: string;

    @ManyToOne((type) => Countries)
    @JoinColumn({ name: "country_id", referencedColumnName: "id" })
    country_id: string;

    @Column({
        type: "varchar",
        default: null,
    })
    fips_code: string;

    @Column({
        type: "varchar",
        default: null,
    })
    iso2: string;

    @Column({
        length: 191,
        type: "varchar",
        default: null,
    })
    type: string;

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
