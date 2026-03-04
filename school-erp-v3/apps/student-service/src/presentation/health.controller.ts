import { Controller, Get, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';

@Controller('health/student')
export class HealthController {
    constructor(
        private dataSource: DataSource,
        @Inject('REDIS_CLIENT') private redis: Redis
    ) { }

    @Get()
    async check() {
        const dbStatus = await this.checkDb();
        const redisStatus = await this.checkRedis();

        return {
            status: (dbStatus && redisStatus) ? 'UP' : 'DOWN',
            timestamp: new Date().toISOString(),
            services: {
                database: dbStatus ? 'UP' : 'DOWN',
                redis: redisStatus ? 'UP' : 'DOWN',
            },
            version: '3.0.0-lockdown'
        };
    }

    private async checkDb(): Promise<boolean> {
        try {
            await this.dataSource.query('SELECT 1');
            return true;
        } catch (e) {
            return false;
        }
    }

    private async checkRedis(): Promise<boolean> {
        try {
            const pong = await this.redis.ping();
            return pong === 'PONG';
        } catch (e) {
            return false;
        }
    }
}
