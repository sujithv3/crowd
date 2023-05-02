import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from "typeorm";

export enum TYPE {
    MAIL = "MAIL",
    CONTENT = "CONTENT",
    MAIL_TEMPLATE = "MAIL TEMPLATE",
    HOME_PAGE = "HOME Page",
    FOOTER = "FOOTER",
}

export enum USER_TYPE {
    STARTUP = "STARTUP",
    INVESTOR = "INVESTOR",
    SALES_EXECUTIVE = "SALES_EXECUTIVE",
    ADMIN = "ADMIN",
    RM = "RM"
};

import { ChatGroupMember } from './chatGroupMembers';
import { ChatGroup } from './chatGroup';

export enum MESSAGE_TYPE {
    CONTENT = "CONTENT",
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    DOCUMENT = "DOCUMENT",
};

@Entity()
export class ChatMessage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "text",
        default: null,
    })
    message: string;

    @Column({
        type: "boolean",
        default: true,
    })
    latest: boolean;

    @Column({
        type: "boolean",
        default: false,
    })
    read: boolean;

    @Column({
        type: "enum",
        enum: MESSAGE_TYPE,
        default: MESSAGE_TYPE.CONTENT,
    })
    message_type: string;

    @ManyToOne((type) => ChatGroupMember)
    @JoinColumn({ name: "from_id", referencedColumnName: "id" })
    from: ChatGroupMember;

    @ManyToOne((type) => ChatGroup)
    @JoinColumn({ name: "group_id", referencedColumnName: "id" })
    group: ChatGroup;

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