import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Modules
import { ProductsModule } from './modules/products/products.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { OrdersModule } from './modules/orders/orders.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ContentModule } from './modules/content/content.module';
import { ArtisansModule } from './modules/artisans/artisans.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { EmailModule } from './modules/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: ['src/**/*.entity.ts'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    ProductsModule,
    CollectionsModule,
    OrdersModule,
    UsersModule,
    AuthModule,
    CartModule,
    WishlistModule,
    PaymentModule,
    ContentModule,
    ArtisansModule,
    AnalyticsModule,
    EmailModule,
  ],
})
export class AppModule {}
