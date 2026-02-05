import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() data: any) {
    return this.authService.register(data);
  }

  @Post('login')
  async login(@Body() { email, password }: any) {
    return this.authService.login(email, password);
  }

  @Post('refresh-token')
  async refreshToken(@Body('token') token: string) {
    return this.authService.refreshToken(token);
  }

  @Post('password-reset')
  async resetPassword(@Body('email') email: string) {
    return this.authService.resetPassword(email);
  }
}
