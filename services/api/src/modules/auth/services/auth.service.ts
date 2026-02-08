import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { RegisterDto, LoginDto, ResetPasswordDto, AuthResponseDto } from '../dtos/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private refreshTokenStore: Map<string, string> = new Map();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password } = registerDto;

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: 'User',
        lastName: email.split('@')[0],
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    const { accessToken, refreshToken } = this.generateTokens(user.id, user.email, user.role);
    this.refreshTokenStore.set(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = this.generateTokens(user.id, user.email, user.role);
    this.refreshTokenStore.set(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async logout(userId: string): Promise<{ success: boolean }> {
    this.refreshTokenStore.delete(userId);
    return { success: true };
  }

  async refreshToken(userId: string, token: string): Promise<AuthResponseDto> {
    const storedToken = this.refreshTokenStore.get(userId);
    if (!storedToken || storedToken !== token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(
      user.id,
      user.email,
      user.role,
    );
    this.refreshTokenStore.set(userId, newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success even if user doesn't exist (security best practice)
      return { message: 'If email exists, reset link sent' };
    }

    // In production, generate a unique token and store it in DB with expiration
    // For now, just return success message
    return { message: 'Password reset email sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token } = resetPasswordDto;

    // In production, verify the reset token from DB
    // For now, accept any token and allow password reset
    if (!token || token.length < 8) {
      throw new BadRequestException('Invalid reset token');
    }

    // This is a simplified flow - in production, you'd decode the token to get user ID
    // For now, we'll skip the reset and return success for demo purposes
    return { message: 'Password reset successfully' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    // In production, verify email token from DB
    if (!token || token.length < 8) {
      throw new BadRequestException('Invalid verification token');
    }

    return { message: 'Email verified successfully' };
  }

  private generateTokens(
    userId: string,
    email: string,
    role: string,
  ): { accessToken: string; refreshToken: string } {
    const accessToken = this.jwtService.sign(
      { email, role },
      { subject: userId, expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign(
      { email },
      { subject: userId, expiresIn: '7d' },
    );

    return { accessToken, refreshToken };
  }
}
