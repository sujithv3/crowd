import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    OneToOne,
    OneToMany,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

import { Users } from "./Users";

@Entity()
export class LegalStatusStartup {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne((type) => Users, (Users) => Users.legalStatusStartup)
    @JoinColumn({ name: "startup_id", referencedColumnName: "id" })
    User: Users;

    @Column({
        default: false,
    })
    mail_mobile: boolean;
    
    @Column({
        default: false,
    })
    bankDetails: boolean;
    
    @Column({
        default: false,
    })
    pitchDeck: boolean;
    
    @Column({
        default: false,
    })
    documents: boolean;

    @CreateDateColumn()
    created_date: Date;

    @UpdateDateColumn()
    updated_date: Date;

    @Column({
        default: true,
    })
    is_active: boolean;

    @Column({
        default: false,
    })
    is_deleted: boolean;

    @Column({
        default: false,
    })
    is_verify: boolean;

}
