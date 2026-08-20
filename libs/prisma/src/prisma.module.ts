import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaServiceWrite } from './prisma-write.service';
import { PrismaReadService } from './prisma-read.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [PrismaServiceWrite, PrismaReadService],
  exports: [PrismaServiceWrite, PrismaReadService],
})
export class PrismaModule {}
