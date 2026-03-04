import { Controller, Get, Post } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { DataSource } from 'typeorm';
import { Public } from '@libs/security/public.decorator';
import { DemoSeederService } from './demo-seeder.service';

@Controller('health')
@SkipThrottle()
export class SystemHealthController {
    constructor(
        private dataSource: DataSource,
        private seeder: DemoSeederService
    ) { }

    @Public()
    @Get()
    @SkipThrottle()
    async check() {
        try {
            console.log(`[SystemHealthController] Health check triggered.`);
            const dbConnected = this.dataSource.isInitialized;
            return {
                status: 'OK',
                database: dbConnected ? 'CONNECTED' : 'DISCONNECTED',
                timestamp: new Date().toISOString(),
                version: '3.0.0-stabilized'
            };
        } catch (err: any) {
            console.error(`[SystemHealthController] CRITICAL FAILURE:`, err.stack);
            throw err;
        }
    }

    @Public()
    @Post('seed')
    async seed() {
        try {
            console.log(`[SystemHealthController] Seeding triggered.`);
            await this.seeder.seed();
            return { message: 'Demo data seeded successfully' };
        } catch (err: any) {
            console.error(`[SystemHealthController] SEEDING FAILED:`, err.stack);
            throw err;
        }
    }
}
