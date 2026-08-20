import { Injectable } from '@nestjs/common';
import { ProductDto } from '../dto/product.dto';
import { PrismaServiceWrite } from '@app/prisma';
import { PrismaReadService } from '@app/prisma/prisma-read.service';

export interface ReservedItem {
  productId: string;
  quantity: number;
  price: number;
}

@Injectable()
export class ProductServiceService {
  constructor(
    private readonly prismaWrite: PrismaServiceWrite,
    private readonly prismaRead: PrismaReadService
  ) { }

  async getProducts() {
    return this.prismaRead.product.findMany()
  }

  async createProduct(data: ProductDto) {
    return this.prismaWrite.product.create({
      data: {
        name: data.name,
        price: data.price,
        stock: data.stock
      }
    })
  }

  async reserveStock(items: { productId: string; quantity: number }[]) {
    return this.prismaWrite.$transaction(async (tx) => {
      let totalAmount = 0;

      const orderItems: ReservedItem[] = [];

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: product.stock - item.quantity },
        });
        totalAmount += product.price * item.quantity;
        orderItems.push({ productId: product.id, quantity: item.quantity, price: product.price });
      }
      return { success: true, totalAmount, items: orderItems };
    }).catch(err => ({ success: false, message: err.message }));
  }
}

