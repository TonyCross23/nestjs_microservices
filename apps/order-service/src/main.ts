import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { OrderServiceModule } from './order-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(OrderServiceModule, {
    transport: Transport.TCP,
    options: { host: "127.0.0.1", port: 3003}
  });
  await app.listen();
  console.log('Order Service running on TCP:3003');
}
bootstrap();
