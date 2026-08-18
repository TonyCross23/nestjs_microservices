import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ApiGatewayController } from './api-gateway.controller';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    ClientsModule.register([
      { name: 'AUTH_SERVICE', transport: Transport.TCP, options: { host: '127.0.0.1', port: 3001 } },
      { name: 'PRODUCT_SERVICE', transport: Transport.TCP, options: { host: '127.0.0.1', port: 3002 } },
      { name: 'ORDER_SERVICE', transport: Transport.TCP, options: { host: '127.0.0.1', port: 3003 } },
    ])
  ],
  controllers: [ApiGatewayController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard}],
})
export class ApiGatewayModule {}
