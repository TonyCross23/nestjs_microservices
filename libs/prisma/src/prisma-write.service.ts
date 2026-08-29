import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
import { Pool } from "pg";

@Injectable()
export class PrismaServiceWrite extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private pool: Pool;

    constructor(config: ConfigService) {
        const connectionString = config.getOrThrow<string>('database.writeUrl');

        const pool = new Pool({ connectionString });
        const adapter = new PrismaPg(pool);

        super({ adapter })

        this.pool = pool
    }

    async onModuleInit() {
        await this.$connect()
    }

    async onModuleDestroy() {
        await this.$disconnect();
        await this.pool.end();
    }
}
