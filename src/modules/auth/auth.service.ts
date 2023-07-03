import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ) {
    const user = await this.usersService.findByEmail(email);

    if (user) {
      const isPasswordMatching = await compare(password, user.password);

      if (isPasswordMatching) {
        return { email: user.email };
      }
    }

    return null;
  }

  async login(email: string) {
    const user = await this.usersService.findByEmail(email);

    return {
        token: await this.jwtService.sign({email: email}, { subject: user.id })
    }
  } 
}
