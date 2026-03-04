import { Controller, Post, Get, Body, UseGuards, Req, Param, Query } from '@nestjs/common';
import { PayrollService } from '../use-cases/payroll.service';
import { JwtAuthGuard } from '@libs/security/jwt-auth.guard';
import { RbacGuard } from '@libs/rbac/rbac.guard';
import { RequirePermissions } from '@libs/rbac/permissions.decorator';

@Controller('finance/payroll')
@UseGuards(JwtAuthGuard, RbacGuard)
export class PayrollController {
    constructor(private readonly service: PayrollService) { }

    @Post('salary-structure')
    @RequirePermissions('finance.manage')
    async createSalaryStructure(@Body() dto: any, @Req() req: any) {
        return this.service.createSalaryStructure(req.user.schoolId, dto);
    }

    @Post('process')
    @RequirePermissions('finance.manage')
    async process(@Body() dto: { month: string }, @Req() req: any) {
        const count = await this.service.processMonthlyPayroll(req.user.schoolId, dto.month, req.user.id);
        return { message: `Payroll processed for ${count} staff members`, count };
    }

    @Get('staff/:staffId')
    @RequirePermissions('finance.read')
    async getHistory(@Param('staffId') staffId: string, @Req() req: any) {
        return this.service.getStaffPayrollHistory(req.user.schoolId, staffId);
    }
}
