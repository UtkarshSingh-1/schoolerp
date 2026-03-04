import { Controller, Post, Get, Body, Param, UseGuards, Patch, Req } from '@nestjs/common';
import { AggregateViolationsUseCase } from '../use-cases/aggregate-violations.use-case';
import { CreateViolationRecordDto } from './dto/create-violation-record.dto';
import { RbacGuard } from '@libs/rbac/rbac.guard';
import { RequirePermissions } from '@libs/rbac/permissions.decorator';
import { ViolationRepository } from '../infrastructure/violation.repository';

@Controller('violations')
@UseGuards(RbacGuard)
export class ViolationController {
    constructor(
        private readonly aggregateViolationsUseCase: AggregateViolationsUseCase,
        private readonly violationRepository: ViolationRepository
    ) { }

    @Post('record')
    @RequirePermissions('exam.manage_violations')
    async record(@Body() dto: CreateViolationRecordDto) {
        return this.aggregateViolationsUseCase.execute(dto);
    }

    @Get()
    @RequirePermissions('exam.read')
    async findAll(@Req() req: any) {
        return this.violationRepository.findBySchool(req.user.schoolId);
    }

    @Get('student/:id')
    @RequirePermissions('exam.read')
    async findByStudent(@Param('id') id: string, @Req() req: any) {
        return this.violationRepository.findByStudent(req.user.schoolId, id);
    }
}
