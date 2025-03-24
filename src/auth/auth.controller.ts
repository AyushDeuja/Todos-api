import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsNotEmpty, IsString } from 'class-validator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
}
