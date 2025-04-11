import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { compare } from 'bcrypt';
import { UpdateProfileDto } from './dto/update-user.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { randomInt } from 'crypto';
import { generate } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectQueue('auth') private readonly queue: Queue,
  ) {}

  // Ensure the OTP is unique by checking against existing codes in the database
  async generateVerificationCode() {
    let verificationCode: number;
    do {
      verificationCode = randomInt(100000, 999999);
      const existingCode = await this.prisma.verificationCode.findFirst({
        where: { verificationCode },
      });
      if (!existingCode) {
        return verificationCode;
      }
    } while (true);
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);

    //generate 6-digit OTP
    const otp = await this.generateVerificationCode();
    //Store OTP in the VerificationCide table
    await this.prisma.verificationCode.create({
      data: {
        userId: user.id,
        verificationCode: otp,
      },
    });

    //for queuing mail
    await this.queue.add('verifyEmailAddress', {
      from: 'info@todoapp.com',
      to: user.email,
      otp: otp,
    });
    const token = await this.jwtService.sign(user);
    return { token };
  }
  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findFirst({
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
      throw new NotFoundException('Unable to find user');
    }

    const isPasswordValid = await compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.jwtService.signAsync(user);
    return { token };
  }

  //profile id update
  async profile(user_id: number) {
    return this.usersService.findOne(user_id);
  }
  async updateProfile(user_id: number, updateProfileDto: UpdateProfileDto) {
    return this.usersService.update(user_id, updateProfileDto);
  }
}
