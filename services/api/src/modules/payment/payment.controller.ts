import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('process')
  async processPayment(@Body() { orderId, ...data }: any) {
    return this.paymentService.processPayment(orderId, data);
  }

  @Get('verify/:transactionId')
  async verifyPayment(@Param('transactionId') transactionId: string) {
    return this.paymentService.verifyPayment(transactionId);
  }

  @Post('refund/:orderId')
  async refundPayment(@Param('orderId') orderId: string) {
    return this.paymentService.refundPayment(orderId);
  }
}
