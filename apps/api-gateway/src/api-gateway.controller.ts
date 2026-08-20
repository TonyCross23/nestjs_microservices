import { Body, Controller, Get, Headers, Inject, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import z from 'zod';
import { ZodValidationPipe } from './zod.pipe';
import { AuthGuard } from 'apps/auth-service/src/auth.guard';
import { LoginDto, loginSchema, registerSchema } from 'apps/auth-service/dto/auth-service.dto';
import { GetUser } from 'apps/auth-service/src/get-user.decorator';
import { CreateOrderDto } from 'apps/order-service/dto/order.dto';
import { ProductDto } from 'apps/product-service/dto/product.dto';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).nonempty(),
});

const CreateProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  description: z.string().optional(),
  stock: z.number().int().nonnegative(),
});

@Controller()
export class ApiGatewayController {
  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    @Inject('PRODUCT_SERVICE') private productClient: ClientProxy,
    @Inject('ORDER_SERVICE') private orderClient: ClientProxy,
  ) { }

  @Post('auth/register')
  register(@Body(new ZodValidationPipe(registerSchema)) body: any) {
    return this.authClient.send({ cmd: 'register' }, body)
  }

  @Post('auth/login')
  login(@Body(new ZodValidationPipe(loginSchema)) body: LoginDto) {
    return this.authClient.send({ cmd: 'login' }, body)
  }

  @UseGuards(AuthGuard)
  @Get('products')
  getProducts() {
    return this.productClient.send({ cmd: 'get_products' }, {})
  }

  @UseGuards(AuthGuard)
  @Post('products')
  createProduct(@Body(new ZodValidationPipe(CreateProductSchema)) body: ProductDto) {
    return this.productClient.send({ cmd: 'create_product' }, body);
  }

  @UseGuards(AuthGuard)
  @Post('orders')
  async createOrder(
    @GetUser() user: any, 
    @Body(new ZodValidationPipe(CreateOrderSchema)) body: CreateOrderDto,
  ) {
    return this.orderClient.send(
      { cmd: 'create_order' },
      { ...body, userId: user.userId },
    );
  }

}
