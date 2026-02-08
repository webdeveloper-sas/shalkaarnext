import { IsEmail, IsString, IsUUID } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class LogoutDto {
  @IsUUID()
  userId: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class RequestPasswordResetDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  password: string;
}

export class VerifyEmailDto {
  @IsString()
  token: string;
}

export class AuthResponseDto {
  accessToken: string;
  refreshToken?: string;
  user?: Record<string, any>;
}
