import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthServiceModule } from './auth-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthServiceModule, {
    transport: Transport.TCP,
    options: { host: '127.0.0.1', port: 3001}
  });
  await app.listen();
  console.log('Auth Microservice listening on TCP:3001');
}
bootstrap();
