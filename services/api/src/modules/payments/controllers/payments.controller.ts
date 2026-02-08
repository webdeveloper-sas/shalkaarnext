import { Controller, Post, Body, UseGuards, HttpCode, Param } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { PaymentInitiationDto, PaymentResponseDto, RefundRequestDto } from '../dtos/payment.dto';
import { JwtAuthGuard } from '../../../common/guards';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async initiatePayment(@Body() dto: PaymentInitiationDto): Promise<PaymentResponseDto> {
    const result = await this.paymentService.processPayment({
      orderId: dto.orderId,
      amount: dto.amount,
      currency: 'INR',
      email: dto.email,
    });

    return {
      ...result,
      orderId: dto.orderId,
    };
  }

  @Post('webhook/:transactionId')
  @HttpCode(200)
  async handleWebhook(@Param('transactionId') transactionId: string) {
    const confirmed = await this.paymentService.webhookPaymentConfirmed(transactionId);
    return {
      success: confirmed,
      message: confirmed ? 'Payment confirmed' : 'Payment not found',
    };
  }

  @Post('refund')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async refund(@Body() dto: RefundRequestDto): Promise<PaymentResponseDto> {
    const result = await this.paymentService.refundPayment(dto.transactionId, dto.amount);
    return result;
  }
}
