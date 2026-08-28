import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("employees")
export class Employee{

    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    firstName:string;

    @Column()
    lastName:string;

    @Column({unique:true})
    email:string;

    @Column()
    department:string;

    @Column()
    role:string;

    @Column()
    salary:string;

    @Column({default:true})
    isActive:boolean;

    @CreateDateColumn()
    createdAt:Date;

    @UpdateDateColumn()
    updatedAt:Date;
}