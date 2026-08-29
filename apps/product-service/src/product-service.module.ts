import { PrismaModule } from '@app/prisma';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductServiceController } from './product-service.controller';
import { ProductServiceService } from './product-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => ({
        database: {
          writeUrl: process.env.PRODUCT_DATABASE_URL_WRITE,
          readUrl: process.env.PRODUCT_DATABASE_URL_READ,
        },
      })],
    }),
    PrismaModule,
  ],
  controllers: [ProductServiceController],
  providers: [ProductServiceService],
})
export class ProductServiceModule {}
