// src/entities/plantation.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Field } from './field.entity';

@Entity('plantations')
export class Plantation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    location: string;

    @Column({ default: 'Cameroon' })
    country: string;

    @Column({ nullable: true })
    region: string; // West, Northwest, etc.

    @ManyToOne(() => User, user => user.plantations)
    owner: User;

    @Column()
    ownerId: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    // Relations
    @OneToMany(() => Field, field => field.plantation)
    fields: Field[];
}