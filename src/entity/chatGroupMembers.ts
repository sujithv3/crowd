import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from "typeorm";

import { Users } from "./Users";
import { rmAdmin } from "./rmAdmin";
import { ChatGroup } from './chatGroup'

export enum USER_TYPE {
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
        enum: USER_TYPE,
        default: USER_TYPE.RM,
    })
    user_type: string;

    @ManyToOne((type) => ChatGroup)
    @JoinColumn({ name: "group_id", referencedColumnName: "id" })
    group: ChatGroup;

    @ManyToOne((type) => Users)
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    user: Users;

    @ManyToOne((type) => rmAdmin)
    @JoinColumn({ name: "execuive_id", referencedColumnName: "id" })
    executive: rmAdmin;

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
