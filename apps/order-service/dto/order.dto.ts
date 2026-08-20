import z from 'zod';
import { createZodDto } from 'nestjs-zod';

export const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

// Create Order Schema
export const createOrderSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  items: z
    .array(orderItemSchema)
    .min(1, 'At least one item is required to create an order'),
});

export class CreateOrderDto extends createZodDto(createOrderSchema) {}