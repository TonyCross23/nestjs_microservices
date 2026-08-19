import { PrismaService } from '@app/prisma';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderConsumer {
  constructor(private readonly prisma: PrismaService) {}

  @RabbitSubscribe({
    exchange: 'orders_exchange',
    routingKey: 'order.created',
    queue: 'orders_processing_queue',
  })
  public async handleOrderCreated(msg: any) {
    console.log(`[RabbitMQ Event Received] Updating status for Order ID: ${msg.orderId}`);
    await this.prisma.order.update({
      where: { id: msg.orderId },
      data: { status: 'PROCESSING' },
    });
  }
}