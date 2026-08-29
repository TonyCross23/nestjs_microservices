import { Controller } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { AuthServiceService } from './auth-service.service';
import { CreateSellerDto, LoginDto, RefreshTokenDto, RegisterDto } from '../dto/auth-service.dto';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

  @MessagePattern({ cmd: 'register'})
  async register(data: RegisterDto) {
    try {
      return await this.authServiceService.register(data);
    } catch (error) {
      throw new RpcException({
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  }

  @MessagePattern({ cmd: 'login'})
  async login(data: LoginDto) {
    return this.authServiceService.login(data)
  }

  @MessagePattern({ cmd: 'refresh_token' })
  refresh(data: RefreshTokenDto) {
    return this.authServiceService.refresh(data);
  }

  @MessagePattern({ cmd: 'logout' })
  logout(data: { userId: string }) {
    return this.authServiceService.logout(data.userId);
  }

  @MessagePattern({ cmd: 'create_seller' })
  createSeller(data: CreateSellerDto) {
    return this.authServiceService.createSeller(data);
  }

  @MessagePattern({ cmd: 'get_users' })
  getUsers() {
    return this.authServiceService.listUsers();
  }

  @MessagePattern({ cmd: 'validate_token'})
  validate(data: {token: string}) {
    return this.authServiceService.verifyToken(data.token)
  }

}
