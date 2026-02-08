import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CartService } from './services/cart.service';
import { CartController } from './controllers/cart.controller';

@Module({
  imports: [PrismaModule],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}
