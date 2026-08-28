import { ConflictException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler.js';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository:Repository<User>
    ){}

    async findUserByUsername(username:string):Promise<User|null>{
        return this.userRepository.findOne({
            where:{
                username
            }
        });
    }

    async findUserByEmail(email:string):Promise<User|null>{
        return this.userRepository.findOne({
            where:{
                email
            }
        });
    }

    async findUserById(id:number):Promise<User|null>{
        return this.userRepository.findOne({
            where:{
                id
            }
        });
    }

    async createUser(name:string,username:string,email:string,password:string):Promise<User>{
        const existingUsername=await this.findUserByUsername(username);

        if(existingUsername){
            throw new ConflictException("Username Already Exists");
        }

        const existingEmail=await this.findUserByEmail(email);

        if(existingEmail){
            throw new ConflictException("Email Already Exists");
        }

        const user=this.userRepository.create({
            name,username,email,password
        });

        return this.userRepository.save(user);
    }
}
