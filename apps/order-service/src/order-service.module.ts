import { PrismaModule } from '@app/prisma';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrderServiceController } from './order-service.controller';
import { OrderServiceService } from './order-service.service';
import { OrderConsumer } from './order.consumer';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ClientsModule.register([
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: "127.0.0.1",
          port: 3002
        }
      }
    ]),
    RabbitMQModule.forRoot({
      exchanges: [{ name: 'orders_exchange', type: 'topic' }],
      uri: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
      connectionInitOptions: { wait: false },
    }),
  ],
  controllers: [OrderServiceController],
  providers: [OrderServiceService, OrderConsumer],
})
export class OrderServiceModule { }
