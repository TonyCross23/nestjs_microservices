import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthServiceService } from './auth-service.service';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

  @MessagePattern({ cmd: 'register'})
   register(data: any) { 
    return this.authServiceService.register(data)
  }

  @MessagePattern({ cmd: 'login'})
  login(data: any) {
    return this.authServiceService.login(data)
  }

  @MessagePattern({ cmd: 'validate_token'})
  validate(data: {token: string}) {
    return this.authServiceService.verifyToken(data.token)
  }

}
