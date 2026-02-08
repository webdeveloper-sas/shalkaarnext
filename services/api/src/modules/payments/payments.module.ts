import { Module } from '@nestjs/common';
import { PaymentService } from './services/payment.service';
import { PaymentsController } from './controllers/payments.controller';

@Module({
  providers: [PaymentService],
  controllers: [PaymentsController],
  exports: [PaymentService],
})
export class PaymentsModule {}
