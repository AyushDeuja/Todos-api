import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { LoginDto, RegisterDto } from './auth.controller';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.userService.create(registerDto);
    const token = await this.jwtService.signAsync({
      user_id: user.id,
    });
    return token;
  }

  async login(loginDto: LoginDto) {
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [
          {
            email: loginDto.username,
          },
          {
            mobile: loginDto.username,
          },
        ],
      },
    });

    if (!user) {
      throw new NotFoundException(`User ${loginDto.username} not found`);
    }

    if (!(await compare(loginDto.password, user.password))) {
      throw new UnauthorizedException(`Invalid credentials`);
    }

    const token = await this.jwtService.signAsync({
      user_id: user.id,
    });
    return token;
  }
}
