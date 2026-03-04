import { CanActivate, ExecutionContext, Injectable, Logger, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { DataSource } from 'typeorm';
import { User } from '../../../apps/auth-service/src/domain/user.entity';
import Redis from 'ioredis';

@Injectable()
export class WsJwtGuard implements CanActivate {
    private readonly logger = new Logger(WsJwtGuard.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly dataSource: DataSource,
        @Inject('REDIS_CLIENT')
        private readonly redis: Redis
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (context.getType() !== 'ws') {
            return true;
        }

        const client: Socket = context.switchToWs().getClient();
        const token = this.extractToken(client);

        if (!token) {
            this.logger.error('No token found in WebSocket handshake');
            throw new WsException('Unauthorized: Missing credentials');
        }

        try {
            const payload = this.jwtService.verify(token);

            // 1. REDIS: Check for revoked tokens
            const isRevoked = await this.redis.get(`revoked_token:${token}`);
            if (isRevoked) {
                this.logger.error(`Token revoked: ${token}`);
                throw new WsException('Unauthorized: Token revoked');
            }

            // 2. DB VALIDATION: Verify user status and schoolId match
            const user = await this.dataSource.getRepository(User).findOne({
                where: { id: payload.sub }
            });

            if (!user || !user.isActive || user.schoolId !== payload.schoolId) {
                this.logger.error(`User validation failed for: ${payload.sub}`);
                throw new WsException('Unauthorized: User validation failed');
            }

            // Attach verified data to the socket
            client.data.user = {
                id: user.id,
                email: user.email,
                schoolId: user.schoolId,
                roleId: user.roleId
            };

            return true;
        } catch (error: any) {
            this.logger.error(`Unauthorized connection attempt: ${error.message}`);
            throw new WsException('Unauthorized: Access denied');
        }
    }

    private extractToken(client: Socket): string | null {
        // Support token in handshake headers or query string
        const authHeader = client.handshake.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.split(' ')[1];
        }

        return (client.handshake.query?.token as string) || null;
    }
}
