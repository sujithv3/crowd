import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany
} from "typeorm";

export enum GROUP_TYPE {
    INDIVIDUAL = "INDIVIDUAL",
    GROUP = "GROUP",
    STARTUP = "STARTUP",
    INVESTOR = "INVESTOR",
    SUPPORT = "SUPPORT",
};
import { ChatGroupMember } from "./chatGroupMembers";

@Entity()
export class ChatGroup {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(() => ChatGroupMember, (members) => members.group)
    members: ChatGroupMember[];

    @Column({
        type: "enum",
        enum: GROUP_TYPE,
        default: GROUP_TYPE.STARTUP,
    })
    type: string;

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
