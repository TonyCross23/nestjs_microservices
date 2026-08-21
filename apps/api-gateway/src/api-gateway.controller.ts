import { Body, Controller, Get, Inject, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import z from 'zod';
import { ZodValidationPipe } from './zod.pipe';
import { AuthGuard } from 'apps/auth-service/src/auth.guard';
import { createSellerSchema, LoginDto, loginSchema, refreshTokenSchema, registerSchema } from 'apps/auth-service/dto/auth-service.dto';
import { GetUser } from 'apps/auth-service/src/get-user.decorator';
import { CreateOrderDto } from 'apps/order-service/dto/order.dto';
import { ProductDto } from 'apps/product-service/dto/product.dto';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

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

  @Post('auth/refresh')
  async refresh(@Body(new ZodValidationPipe(refreshTokenSchema)) body: { refreshToken: string }) {
    const auth = await firstValueFrom(this.authClient.send({ cmd: 'refresh_token' }, body));
    if (!auth) throw new UnauthorizedException('Invalid or expired refresh token');
    return auth;
  }

  @UseGuards(AuthGuard)
  @Post('auth/logout')
  logout(@GetUser() user: { userId: string }) {
    return this.authClient.send({ cmd: 'logout' }, { userId: user.userId });
  }

  @UseGuards(AuthGuard)
  @Get('products')
  getProducts() {
    return this.productClient.send({ cmd: 'get_products' }, {})
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SELLER')
  @Post('products')
  createProduct(@Body(new ZodValidationPipe(CreateProductSchema)) body: ProductDto) {
    return this.productClient.send({ cmd: 'create_product' }, body);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('USER')
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

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('auth/sellers')
  createSeller(@Body(new ZodValidationPipe(createSellerSchema)) body: any) {
    return this.authClient.send({ cmd: 'create_seller' }, body);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SELLER')
  @Get('users')
  getUsers() {
    return this.authClient.send({ cmd: 'get_users' }, {});
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SELLER')
  @Get('orders')
  getOrders() {
    return this.orderClient.send({ cmd: 'get_orders' }, {});
  }

}
