import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from "bcrypt";
import { LoginDto, RegisterDto } from '../dto/auth-service.dto';
import { RpcException } from '@nestjs/microservices';
import { PrismaServiceWrite } from '@app/prisma';

@Injectable()
export class AuthServiceService {
  constructor(
    private jwtService: JwtService,
    private readonly prisma: PrismaServiceWrite,
  ) { }

  async register(data: RegisterDto) {

    const existingUser = await this.prisma.user.findUnique({ 
      where: { email: data.email }
    })

    if(existingUser) {
        throw new RpcException({
        statusCode: 400,
        message: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name
      }
    })

    return {
      id: user.id,
      email: user.email,
      token: this.jwtService.sign({ sub: user.id, email: user.email })
    };
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: data.email } });
    
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new RpcException({
        statusCode: 400,
        message: 'Invalid credentials'
      });
    }

    return { token: this.jwtService.sign({ sub: user.id, email: user.email }) };
  }

  verifyToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      return { userId: decoded.sub, email: decoded.email };
    } catch {
      return null;
    }
  }
}
