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

export enum GROUP_STATUS {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    DEAL_CLOSED = "DEAL_CLOSED",
};
import { ChatGroupMember } from "./chatGroupMembers";
import { ChatMessage } from "./chatMessages";

@Entity()
export class ChatGroup {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(() => ChatGroupMember, (members) => members.group)
    members: ChatGroupMember[];

    @OneToMany(() => ChatMessage, (chat) => chat.group)
    messages: ChatMessage[];

    @Column({
        type: "enum",
        enum: GROUP_TYPE,
        default: GROUP_TYPE.STARTUP,
    })
    type: string;

    @Column({
        type: "enum",
        enum: GROUP_STATUS,
        default: GROUP_STATUS.ACTIVE,
    })
    status: string;

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

    @Column({
        type: 'boolean',
        default: true
    })
    is_active: boolean;

    @Column({
        default: false,
    })
    is_deleted: boolean;

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
