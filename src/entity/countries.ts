import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity()
export class Countries {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 100,
        type: "varchar",
        default: null,
    })
    name: string;

    @Column({
        length: 3,
        type: "char",
        default: null,
    })
    iso3: string;


    @Column({
        length: 3,
        type: "char",
        default: null,
    })
    numeric_code: string;

    @Column({
        length: 2,
        type: "char",
        default: null,
    })
    iso2: string;

    @Column({
        type: "varchar",
        default: null,
    })
    phonecode: string;

    @Column({
        type: "varchar",
        default: null,
    })
    capital: string;

    @Column({
        type: "varchar",
        default: null,
    })
    currency: string;

    @Column({
        type: "varchar",
        default: null,
    })
    currency_name: string;


    @Column({
        type: "varchar",
        default: null,
    })
    currency_symbol: string;

    @Column({
        type: "varchar",
        default: null,
    })
    tld: string;

    @Column({
        type: "varchar",
        default: null,
    })
    native: string;

    @Column({
        type: "varchar",
        default: null,
    })
    region: string;

    @Column({
        type: "varchar",
        default: null,
    })
    subregion: string;


    @Column({
        type: "text",
        default: null,
    })
    timezones: string;

    @Column({
        type: "text",
        default: null,
    })
    translations: string;

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
        length: 191,
        type: "varchar",
        default: null,
    })
    emoji: string;


    @Column({
        length: 191,
        type: "varchar",
        default: null,
    })
    emojiU: string;


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

    @Column({
        default: false,
    })
    is_active: boolean;

    @UpdateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
        onUpdate: "CURRENT_TIMESTAMP(6)",
    })
    updated_at: Date;
}
