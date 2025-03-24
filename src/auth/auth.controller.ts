import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class RegisterDto extends CreateUserDto {}

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
