import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity()
export class Video_training {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 150,
        type: "varchar",
        default: null,
    })
    title: string;

    @Column({
        length: 150,
        type: "varchar",
        default: null,
    })
    video_url: string;

    @Column({
        type: "text",
        default: null,
    })
    description: string;

    @Column({
        type: "boolean",
        default: false,
    })
    locked: boolean;

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
