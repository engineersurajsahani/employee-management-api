import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    name: string,
    username: string,
    email: string,
    password: string,
  ) {
    const hashPassword = await bcrypt.hash(password, 10);

    const user = await this.userService.createUser(
      name,
      username,
      email,
      hashPassword,
    );

    const { password: _, ...savedUser } = user;

    return {
      message: 'Registration Successfully!!!',
      user: savedUser,
    };
  }

  async login(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid Email');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid Password');
    }

    const token = await this.jwtService.sign({
      userId: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
    });

    return {
      message: 'Login Successfull!!!',
      token,
    };
  }
}
