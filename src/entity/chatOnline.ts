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

export enum USER_TYPE {
    STARTUP = "STARTUP",
    INVESTOR = "INVESTOR",
    SALES_EXECUTIVE = "SALES_EXECUTIVE",
    ADMIN = "ADMIN",
    RM = "RM"
};

@Entity()
export class ChatOnline {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "enum",
        enum: USER_TYPE,
        default: USER_TYPE.RM,
    })
    user_type: string;

    @ManyToOne((type) => Users)
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    user: Users;

    @ManyToOne((type) => rmAdmin)
    @JoinColumn({ name: "execuive_id", referencedColumnName: "id" })
    executive: rmAdmin;


    @Column({
        type: "varchar",
        length: 200,
        default: null,
    })
    clientId: string;

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
