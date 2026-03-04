import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ProcessPaymentUseCase } from '../use-cases/process-payment.use-case';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { RbacGuard } from '@libs/rbac/rbac.guard';
import { JwtAuthGuard } from '@libs/security/jwt-auth.guard';
import { RequirePermissions } from '@libs/rbac/permissions.decorator';
import { FinanceRepository } from '../infrastructure/finance.repository';

@Controller('finance')
@UseGuards(JwtAuthGuard, RbacGuard)
export class FinanceController {
    constructor(
        private readonly processPaymentUseCase: ProcessPaymentUseCase,
        private readonly financeRepository: FinanceRepository
    ) { }

    @Post('pay')
    @Throttle({ payment: { limit: 10, ttl: 60000 } })
    @RequirePermissions('finance.pay')
    async pay(@Body() dto: ProcessPaymentDto, @Req() req: any) {
        return this.processPaymentUseCase.execute(
            dto,
            req.user.id,
            req.ip,
            req.headers['user-agent'] || 'unknown'
        );
    }

    @Get('transactions')
    @RequirePermissions('finance.read')
    async findAll(@Req() req: any) {
        return this.financeRepository.findBySchool(req.user.schoolId);
    }
}
