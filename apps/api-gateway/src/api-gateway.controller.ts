import { Body, Controller, Get, Headers, Inject, Post, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import z from 'zod';
import { ZodValidationPipe } from './zod.pipe';

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

@Controller()
export class ApiGatewayController {
  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    @Inject('PRODUCT_SERVICE') private productClient: ClientProxy,
    @Inject('ORDER_SERVICE') private orderClient: ClientProxy,
  ) {}

  @Post('auth/register')
  register(@Body(new ZodValidationPipe(RegisterSchema)) body: any) {
    return this.authClient.send({ cmd: 'register'}, body)
  }

  @Post('auth/login')
  login(@Body() body: any) {
    return this.authClient.send({ cmd: 'login'}, body)
  }

  @Get('products')
  getProducts() {
    return this.productClient.send({ cmd: 'get_products'}, {})
  }

  @Post('orders')
  async createOrder(@Headers('authorization') authHeader: string, @Body(new ZodValidationPipe(CreateOrderSchema)) body: any) {
    if (!authHeader) throw new UnauthorizedException('Authorization header not found');
    const token = authHeader.split(' ')[1];

    const user = await firstValueFrom(this.authClient.send({ cmd: 'validate_token' }, { token }));
    if (!user) throw new UnauthorizedException('Invalid Token');

    return this.orderClient.send({ cmd: 'create_order' }, { ...body, userId: user.userId });
  }

}
