import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject('AUTH_SERVICE') private authClient: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException('Authorization header not found');

    const token = authHeader.split(' ')[1];
    const user = await firstValueFrom(this.authClient.send({ cmd: 'validate_token' }, { token }));
    if (!user) throw new UnauthorizedException('Invalid Token');

    req.user = user; // attach for later use in the handler
    return true;
  }
}