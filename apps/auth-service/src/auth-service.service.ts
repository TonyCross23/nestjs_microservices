import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from "bcrypt";

@Injectable()
export class AuthServiceService {
  constructor(
    private jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) { }

  async register(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name
      }
    })

    return {
      id: user.id,
      email: user.email,
      token: this.jwtService.sign({ sub: user.id, email: user.email })
    };
  }

  async login(data: any) {
    const user = await this.prisma.user.findUnique({ where: { email: data.email } });
    
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      return { error: 'Invalid credentials' };
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
