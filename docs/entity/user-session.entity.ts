// src/entities/user-session.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity,';

@Entity('user_sessions')
export class UserSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
    user: User;

    @Column()
    userId: string;

    @Column({ nullable: true })
    deviceType: string; // 'web', 'mobile'

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    lastActive: Date;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}