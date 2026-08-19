import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ProductServiceService } from './product-service.service';

@Controller()
export class ProductServiceController {
  constructor(private readonly productService: ProductServiceService) {}

  @MessagePattern({ cmd: 'get_products' }) 
  getProducts() { 
    return this.productService.getProducts(); 
  }

  @MessagePattern({ cmd: 'reserve_stock' }) 
  reserveStock(data: any) { 
    return this.productService.reserveStock(data.items); 
  }
 
}
