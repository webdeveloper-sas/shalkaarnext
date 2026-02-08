import { IsString, IsNumber, IsEmail, IsOptional } from 'class-validator';

export class PaymentInitiationDto {
  @IsString()
  orderId: string;

  @IsNumber()
  amount: number;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string; // CARD, UPI, WALLET, etc.
}

export class PaymentResponseDto {
  success: boolean;
  transactionId?: string;
  message: string;
  orderId?: string;
}

export class RefundRequestDto {
  @IsString()
  transactionId: string;

  @IsNumber()
  amount: number;
}
