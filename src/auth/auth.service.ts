import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly userService: UsersService,
  ) {}
  async register(registerDto: RegisterDto) {
    const user = await this.userService.create(registerDto);
    return user;
  }
}
