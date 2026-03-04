import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import Redis from 'ioredis';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    private readonly logger = new Logger(JwtAuthGuard.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector,
        @Inject('REDIS_CLIENT') private readonly redis: Redis
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Missing token');
        }

        try {
            // 1. Verify JSON Web Token
            const payload = await this.jwtService.verifyAsync(token);

            // 2. Check Blacklist (Redis)
            const isBlacklisted = await this.redis.get(`revoked_token:${token}`);
            if (isBlacklisted) {
                throw new UnauthorizedException('Token is blacklisted');
            }

            // 3. Attach payload to request
            request['user'] = {
                id: payload.sub,
                email: payload.email,
                schoolId: payload.schoolId,
                roleId: payload.roleId
            };

            return true;
        } catch (err: any) {
            this.logger.error(`JWT Verification Failed: ${err.message}`);
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
