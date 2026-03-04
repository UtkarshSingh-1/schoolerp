import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { BackupService } from '../use-cases/backup.service';
import { JwtAuthGuard } from '@libs/security/jwt-auth.guard';
import { RbacGuard } from '@libs/rbac/rbac.guard';
import { RequirePermissions } from '@libs/rbac/permissions.decorator';

@Controller('finance/admin/backup')
@UseGuards(JwtAuthGuard, RbacGuard)
export class BackupController {
    constructor(private readonly service: BackupService) { }

    @Get('export')
    @RequirePermissions('admin.backup')
    async export(@Req() req: any) {
        return this.service.exportData(req.user.schoolId);
    }
}
