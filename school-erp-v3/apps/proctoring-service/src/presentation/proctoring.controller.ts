import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ReportViolationUseCase } from '../use-cases/report-violation.use-case';
import { ReportViolationDto } from './dto/report-violation.dto';
import { RbacGuard } from '@libs/rbac/rbac.guard';
import { RequirePermissions } from '@libs/rbac/permissions.decorator';
import { ProctoringRepository } from '../infrastructure/proctoring.repository';

@Controller('proctoring')
@UseGuards(RbacGuard)
export class ProctoringController {
    constructor(
        private readonly reportViolationUseCase: ReportViolationUseCase,
        private readonly proctoringRepository: ProctoringRepository
    ) { }

    @Post('violation')
    @RequirePermissions('exam.verify_proctoring') // Often called by client-side AI or background proctors
    async report(@Body() dto: ReportViolationDto, @Req() req: any) {
        return this.reportViolationUseCase.execute(req.user.schoolId, dto);
    }

    @Get('attempt/:id/events')
    @RequirePermissions('exam.read')
    async findByAttempt(@Param('id') id: string, @Req() req: any) {
        return this.proctoringRepository.findByAttempt(req.user.schoolId, id);
    }
}
