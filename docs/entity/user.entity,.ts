// src/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column()
    fullName: string;

    @Column({ default: 'manager' })
    role: string; // 'owner', 'manager', 'supervisor'

    @Column()
    @Exclude()
    passwordHash: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    // Relations
    @OneToMany(() => Plantation, plantation => plantation.owner)
    plantations: Plantation[];

    @OneToMany(() => FieldActivity, activity => activity.performedBy)
    activities: FieldActivity[];
}