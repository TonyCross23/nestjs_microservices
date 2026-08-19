import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { OrderServiceService } from './order-service.service';

@Controller()
export class OrderServiceController {
  constructor(private readonly orderService: OrderServiceService) {}

  @MessagePattern({ cmd: 'create_order'})
  createOrder(data: any) {
    return this.orderService.createOrder(data)
  }
  
}
