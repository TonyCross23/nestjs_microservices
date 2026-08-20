import z from "zod";
import { createZodDto } from 'nestjs-zod';

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Price must be greater than 0"),
  stock: z.number().int("Stock must be an integer").min(0, "Stock cannot be negative"),
});

export class ProductDto extends createZodDto(productSchema) {}