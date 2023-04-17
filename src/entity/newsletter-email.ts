import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

export enum STATUS {
    PENDING = "PENDING",
    SENT = "SENT",
    FAILED = "FAILED",
}

@Entity()
export class NewsletterEmail {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 150,
        type: "varchar",
        default: null,
    })
    subject: string;

    @Column({
        type: "text",
        default: null,
    })
    mail: string;

    @Column({
        type: "integer",
        default: null,
    })
    paket_count: number;

    @Column({
        type: "json",
        default: null,
        nullable: true,
    })
    paket: Array<{ email: string; name: string, companyname: string, id: number }>;

    @Column({
        type: "json",
        default: null,
        nullable: true,
    })
    status: Array<any>;


    @Column({
        type: "enum",
        enum: STATUS,
        default: STATUS.PENDING,
    })
    type: STATUS;

    @Column({ type: "datetime", nullable: false, default: () => 'CURRENT_TIMESTAMP' }) // Schedule Date
    schedule: Date;

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
