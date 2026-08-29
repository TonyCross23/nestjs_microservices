import { PrismaReadService, PrismaServiceWrite } from '@app/prisma';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderServiceService {
  constructor(
    private readonly prismaWrite: PrismaServiceWrite,
    private readonly prismaRead: PrismaReadService,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
    private readonly amqpConnection: AmqpConnection,
  ) { }

  async createOrder(data: { userId: string; items: any[] }) {
    const stockRes: any = await firstValueFrom(
      this.productClient.send({ cmd: 'reserve_stock' }, { items: data.items })
    );

    if (!stockRes.success) return { success: false, message: stockRes.message };

    const order = await this.prismaWrite.order.create({
      data: {
        userId: data.userId,
        totalAmount: stockRes.totalAmount,
        items: { create: stockRes.items },
      },
    });

    await this.amqpConnection.publish('orders_exchange', 'order.created', {
      orderId: order.id,
      userId: order.userId,
    });

    return { success: true, order };
  }

  async listOrders() {
    const orders = await this.prismaRead.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    const totalPrice = orders.reduce((total, order) => total + order.totalAmount, 0);
    return { orders, totalPrice };
  }
}
