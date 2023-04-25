import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from "typeorm";

export enum GROUP_TYPE {
    INDIVIDUAL = "INDIVIDUAL",
    GROUP = "GROUP",
    SUPPORT = "SUPPORT",
};

@Entity()
export class ChatGroup {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "enum",
        enum: GROUP_TYPE,
        default: GROUP_TYPE.INDIVIDUAL,
    })
    group: string;

    @Column({
        type: "int",
        default: null,
    })
    count: number;

    @Column({
        type: "varchar",
        length: 200,
        default: null,
    })
    title: string;

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
