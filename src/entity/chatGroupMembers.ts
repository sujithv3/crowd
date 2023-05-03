import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from "typeorm";

import { Users } from "./Users";
import { rmAdmin } from "./rmAdmin";
import { ChatGroup } from './chatGroup'
import { ChatMessage } from './chatMessages'

export enum MEMBER_TYPE {
    STARTUP = "STARTUP",
    INVESTOR = "INVESTOR",
    SALES_EXECUTIVE = "SALES_EXECUTIVE",
    ADMIN = "ADMIN",
    RM = "RM"
};

@Entity()
export class ChatGroupMember {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "enum",
        enum: MEMBER_TYPE,
        default: MEMBER_TYPE.RM,
    })
    user_type: string;

    @OneToMany(() => ChatMessage, (message) => message.from)
    messages: ChatMessage[];

    @ManyToOne((type) => ChatGroup)
    @JoinColumn({ name: "group_id", referencedColumnName: "id" })
    group: ChatGroup;

    @ManyToOne((type) => Users)
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    user: Users;

    @ManyToOne((type) => rmAdmin)
    @JoinColumn({ name: "execuive_id", referencedColumnName: "id" })
    executive: rmAdmin;

    @Column({
        type: "int",
        nullable: false,
        default: 0,
    })
    unread: number;

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
