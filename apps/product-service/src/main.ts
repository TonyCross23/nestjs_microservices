import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ProductServiceModule } from './product-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(ProductServiceModule, {
    transport: Transport.TCP,
    options: {host: "127.0.0.1", port: 3002}
  });
  await app.listen();
  console.log('Product Service running on TCP:3002');
}
bootstrap();
