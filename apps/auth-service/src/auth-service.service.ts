import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from "bcrypt";
import { CreateSellerDto, LoginDto, RefreshTokenDto, RegisterDto } from '../dto/auth-service.dto';
import { RpcException } from '@nestjs/microservices';
import { PrismaServiceWrite } from '@app/prisma';
import { randomUUID } from 'crypto';

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
        name: data.name,
        role: 'USER',
      }
    })

    return this.createAuthResponse(user);
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: data.email } });
    
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new RpcException({
        statusCode: 400,
        message: 'Invalid credentials'
      });
    }

    return this.createAuthResponse(user);
  }

  async refresh(data: RefreshTokenDto) {
    try {
      const decoded = this.jwtService.verify(data.refreshToken, {
        secret: this.refreshSecret,
      });
      if (decoded.type !== 'refresh') return null;

      const user = await this.prisma.user.findUnique({ where: { id: decoded.sub } });
      if (!user?.refreshTokenHash || !(await bcrypt.compare(data.refreshToken, user.refreshTokenHash))) {
        return null;
      }
      return this.createAuthResponse(user);
    } catch {
      return null;
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
    return { success: true };
  }

  async createSeller(data: CreateSellerDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new RpcException({ statusCode: 400, message: 'User already exists' });
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: await bcrypt.hash(data.password, 10),
        name: data.name,
        role: 'SELLER',
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return user;
  }

  async listUsers() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  verifyToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      if (decoded.type !== 'access') return null;
      return { userId: decoded.sub, email: decoded.email, role: decoded.role };
    } catch {
      return null;
    }
  }

  private get refreshSecret() {
    return process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'supersecretkey123';
  }

  private async createAuthResponse(user: { id: string; email: string; role: string }) {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh', jti: randomUUID() },
      { secret: this.refreshSecret, expiresIn: '7d' },
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: await bcrypt.hash(refreshToken, 10) },
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken,
      // Backward-compatible alias for clients that used `token`.
      token: accessToken,
    };
  }
}
