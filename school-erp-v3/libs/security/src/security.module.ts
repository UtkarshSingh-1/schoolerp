import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import Redis from 'ioredis';
import { WsJwtGuard } from './ws-jwt.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TokenBlacklistService } from './token-blacklist.service';

function getRedisConfig() {
    return {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        maxRetriesPerRequest: 0,
        connectTimeout: 1000,
    };
}

function createRedisClient() {
    const isMock = process.env.USE_REDIS_MOCK !== 'false'; // Default to mock for safety
    console.log(`[Security] Initializing Redis Client. Mock enabled: ${isMock}`);

    let client: any;
    try {
        if (isMock) {
            const MockRedis = require('ioredis-mock');
            client = new MockRedis();
        } else {
            console.log(`[Security] Connecting to Redis at ${process.env.REDIS_HOST}`);
            client = new Redis(getRedisConfig());
        }

        client.on('error', (err: any) => {
            console.error('[Security] Redis Client Error:', err.message);
        });
    } catch (err: any) {
        console.error('[Security] FAILED TO INITIALIZE REDIS CLIENT:', err.message);
        // Fallback to mock if real connection fails during setup
        const MockRedis = require('ioredis-mock');
        client = new MockRedis();
    }

    return client;
}

@Module({
    imports: [
        ConfigModule.forRoot(),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET') || 'super-secret',
                signOptions: { expiresIn: '1h' },
            }),
        }),
        ThrottlerModule.forRootAsync({
            useFactory: () => ({
                throttlers: [
                    { name: 'short', ttl: 60000, limit: 100 },
                    { name: 'login', ttl: 60000, limit: 5 },
                    { name: 'payment', ttl: 60000, limit: 10 },
                    { name: 'admission', ttl: 60000, limit: 3 },
                ],
                // AUDIT FIX: Using in-memory storage for stabilization
                // storage: new ThrottlerStorageRedisService(createRedisClient()),
            }),
        }),
    ],
    providers: [
        // NOTE: ThrottlerGuard is NOT applied globally. Rate limiting is only
        // enforced on specific endpoints via @Throttle() decorator (e.g., login).
        // A global throttle was causing 429 errors on page refresh when the
        // frontend fires multiple concurrent API requests.
        {
            provide: 'REDIS_CLIENT',
            useFactory: () => createRedisClient(),
        },
        WsJwtGuard,
        JwtAuthGuard,
        TokenBlacklistService,
    ],
    exports: ['REDIS_CLIENT', JwtModule, WsJwtGuard, JwtAuthGuard, TokenBlacklistService],
})
export class SecurityModule { }
