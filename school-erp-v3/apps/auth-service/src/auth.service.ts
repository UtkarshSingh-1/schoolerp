import { Injectable, UnauthorizedException, Logger, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './infrastructure/user.repository';
import { User } from './domain/user.entity';
import { Role } from './domain/role.entity';
import { getSchoolId } from '@libs/tenant/tenant.context';
import Redis from 'ioredis';
import { TokenBlacklistService } from '@libs/security';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private jwtService: JwtService,
        private userRepository: UserRepository,
        private tokenBlacklistService: TokenBlacklistService,
        @Inject('REDIS_CLIENT') private redis: Redis
    ) { }

    async login(user: User) {
        try {
            // Reset failure count on successful login
            await this.redis.del(`login_failures:${user.email}`);

            const role = await this.userRepository.manager.getRepository(Role).findOne({
                where: { id: user.roleId }
            });

            const payload = {
                sub: user.id,
                email: user.email,
                schoolId: user.schoolId,
                roleId: user.roleId,
                role: role?.name
            };

            const token = this.jwtService.sign(payload);

            return {
                token: token,
                access_token: token,
                refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: role?.name,
                    schoolId: user.schoolId
                }
            };
        } catch (err: any) {
            console.error(`[AuthService] LOGIN ERROR:`, err.stack);
            throw err;
        }
    }

    async validateUser(email: string, pass: string): Promise<User> {
        const failureKey = `login_failures:${email}`;
        const failures = await this.redis.get(failureKey);
        const failureCount = failures ? parseInt(failures) : 0;

        // PRODUCTION HARDENING: Exponential Backoff
        if (failureCount > 0) {
            const delay = Math.min(30000, Math.pow(2, failureCount - 1) * 1000);
            this.logger.warn(`Delaying login for ${email} by ${delay}ms due to ${failureCount} failures`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        const schoolId = getSchoolId();
        if (!schoolId) throw new UnauthorizedException('Tenant context missing');

        const user = await this.userRepository.findByEmail(schoolId, email);

        if (user) {
            this.logger.log(`[Diagnostic] Email: ${email}, PassLen: ${pass.length}, HashLen: ${user.passwordHash.length}`);
            const isMatch = await bcrypt.compare(pass, user.passwordHash);
            this.logger.log(`[Diagnostic] Match: ${isMatch}`);
            if (isMatch) {
                if (!user.isActive) throw new UnauthorizedException('User account is deactivated');
                return user;
            }
            this.logger.error(`SUSPICIOUS: Repeated login failures for ${email}. Total failures: ${failureCount + 1}`);
        }

        throw new UnauthorizedException('Invalid credentials');
    }

    async refreshToken(refreshToken: string) {
        try {
            const isBlacklisted = await this.tokenBlacklistService.isBlacklisted(refreshToken);
            if (isBlacklisted) {
                throw new UnauthorizedException('Token is blacklisted');
            }

            const payload = this.jwtService.verify(refreshToken);
            const user = await this.userRepository.findOneScoped(payload.schoolId, payload.sub);

            if (!user || !user.isActive) {
                throw new UnauthorizedException();
            }

            return this.login(user); // returns { access_token, refresh_token }
        } catch (e) {
            if (e instanceof UnauthorizedException) throw e;
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }

    async logout(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const exp = payload.exp;
            const now = Math.floor(Date.now() / 1000);
            const expiresIn = exp - now;

            if (expiresIn > 0) {
                await this.tokenBlacklistService.blacklist(refreshToken, expiresIn);
            }
        } catch (e) {
            // Ignore if token is already invalid
        }
    }
}
