import { PrismaModule } from '@app/prisma';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true}),
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecretkey123',
      signOptions: { expiresIn: '1d'}
    })
  ],
  controllers: [AuthServiceController],
  providers: [AuthServiceService],
})
export class AuthServiceModule {}
