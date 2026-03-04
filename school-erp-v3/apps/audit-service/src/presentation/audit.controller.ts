import { Controller, Post, Get, Body, Param, UseGuards, Req, Ip, Headers } from '@nestjs/common';
import { RecordActionUseCase } from '../use-cases/record-action.use-case';
import { RecordActionDto } from './dto/record-action.dto';
import { RbacGuard } from '@libs/rbac/rbac.guard';
import { RequirePermissions } from '@libs/rbac/permissions.decorator';
import { AuditRepository } from '../infrastructure/audit.repository';

@Controller('audit')
@UseGuards(RbacGuard)
export class AuditController {
    constructor(
        private readonly recordActionUseCase: RecordActionUseCase,
        private readonly auditRepository: AuditRepository
    ) { }

    @Post('log')
    @RequirePermissions('system.log_audit') // Internal use or high-level system triggers
    async log(@Body() dto: RecordActionDto, @Req() req: any, @Ip() ip: string, @Headers('user-agent') ua: string) {
        return this.recordActionUseCase.execute(req.user.schoolId, dto, req.user.id, ip, ua);
    }

    @Get()
    @RequirePermissions('system.read_audit')
    async findAll(@Req() req: any) {
        return this.auditRepository.findBySchool(req.user.schoolId);
    }

    async findByUser(@Param('id') id: string, @Req() req: any) {
        return this.auditRepository.findByUser(req.user.schoolId, id);
    }
}
