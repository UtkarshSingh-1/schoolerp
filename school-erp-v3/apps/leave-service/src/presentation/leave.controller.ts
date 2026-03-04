import { Controller, Post, Get, Body, Param, UseGuards, Req, Patch } from '@nestjs/common';
import { ApplyLeaveUseCase } from '../use-cases/apply-leave.use-case';
import { ApplyLeaveDto } from './dto/apply-leave.dto';
import { RbacGuard } from '@libs/rbac/rbac.guard';
import { RequirePermissions } from '@libs/rbac/permissions.decorator';

@Controller('leaves')
@UseGuards(RbacGuard)
export class LeaveController {
    constructor(
        private readonly applyLeaveUseCase: ApplyLeaveUseCase
    ) { }

    @Post('apply')
    @RequirePermissions('leave.apply')
    async apply(@Body() dto: ApplyLeaveDto, @Req() req: any) {
        return this.applyLeaveUseCase.execute(req.user.schoolId, dto, req.user.id);
    }

    @Get()
    @RequirePermissions('leave.read')
    async findAll() {
        // Implement list leave requests logic
        return [];
    }

    @Patch(':id/review')
    @RequirePermissions('leave.review')
    async review(@Param('id') id: string, @Body() reviewDto: any) {
        // Implement review logic (approve/reject)
        return { message: 'Leave request reviewed' };
    }
}
