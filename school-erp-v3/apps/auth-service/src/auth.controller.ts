import { Controller, Post, Body, UnauthorizedException, Get, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '@libs/security/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './presentation/dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('login')
    @Throttle({ login: { limit: 5, ttl: 60000 } }) // AUDIT FIX: 5 attempts per minute
    async login(@Body() dto: LoginDto) {
        try {
            const user = await this.authService.validateUser(dto.email, dto.password);
            if (!user) {
                throw new UnauthorizedException();
            }
            return await this.authService.login(user);
        } catch (error) {
            require('fs').writeFileSync('LOGIN_ERROR.txt', JSON.stringify({
                message: error.message,
                stack: error.stack,
                query: error.query,
                code: error.code
            }, null, 2));
            throw error;
        }
    }

    @Public()
    @Post('refresh')
    async refresh(@Body() dto: { refresh_token: string }) {
        return this.authService.refreshToken(dto.refresh_token);
    }

    @Public()
    @Post('logout')
    async logout(@Body() dto: { refresh_token: string }) {
        await this.authService.logout(dto.refresh_token);
        return { message: 'Logged out successfully' };
    }
}
