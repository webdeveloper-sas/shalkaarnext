import { Module } from '@nestjs/common';

// Database
import { PrismaModule } from './prisma/prisma.module';

// Modules
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { CategoriesModule } from './modules/categories/categories.module';

@Module({
  imports: [
    PrismaModule,
    ProductsModule,
    OrdersModule,
    UsersModule,
    AuthModule,
    CartModule,
    CategoriesModule,
  ],
})
export class AppModule {}
