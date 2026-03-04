import { Controller, Post, Get, Body, UseGuards, Req, Param, Query } from '@nestjs/common';
import { FeeManagementService } from '../use-cases/fee-management.service';
import { JwtAuthGuard } from '@libs/security/jwt-auth.guard';
import { RbacGuard } from '@libs/rbac/rbac.guard';
import { RequirePermissions } from '@libs/rbac/permissions.decorator';

@Controller('finance/fees')
@UseGuards(JwtAuthGuard, RbacGuard)
export class FeeManagementController {
    constructor(private readonly service: FeeManagementService) { }

    @Post('structures')
    @RequirePermissions('finance.manage')
    async createStructure(@Body() dto: any, @Req() req: any) {
        return this.service.createFeeStructure(req.user.schoolId, dto);
    }

    @Post('allocate')
    @RequirePermissions('finance.manage')
    async allocate(@Body() dto: { studentId: string; feeStructureId: string; dueDate: string }, @Req() req: any) {
        return this.service.allocateFee(req.user.schoolId, dto.studentId, dto.feeStructureId, dto.dueDate);
    }

    @Post('pay')
    @RequirePermissions('finance.pay')
    async pay(@Body() dto: { allocationId: string; amount: number; paymentMethod: string }, @Req() req: any) {
        return this.service.processFeePayment(req.user.schoolId, dto.allocationId, dto.amount, dto.paymentMethod, req.user.id);
    }

    @Get('student/:studentId')
    @RequirePermissions('finance.read')
    async getStudentFees(@Param('studentId') studentId: string, @Req() req: any) {
        return this.service.getStudentFees(req.user.schoolId, studentId);
    }

    @Get('transactions')
    @RequirePermissions('finance.read')
    async getTransactions(@Req() req: any) {
        return this.service.getTransactions(req.user.schoolId);
    }
}
