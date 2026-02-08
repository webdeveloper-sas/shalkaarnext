import { Controller, Post, Body, UseGuards, HttpCode } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CurrentUser } from '../../../common/decorators';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  VerifyEmailDto,
  AuthResponseDto,
} from '../dtos/auth.dto';
import { JwtAuthGuard } from '../../../common/guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logout(@CurrentUser() user: any): Promise<{ success: boolean }> {
    return this.authService.logout(user.id);
  }

  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(@Body() _refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    // In production, extract userId from the token
    // For now, return error - client should include userId somehow
    throw new Error('Not implemented - requires backend enhancement');
  }

  @Post('request-password-reset')
  @HttpCode(200)
  async requestPasswordReset(@Body() resetRequestDto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(resetRequestDto.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('verify-email')
  @HttpCode(200)
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }
}
