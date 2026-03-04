import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { SubjectService } from '../use-cases/subject.service';
import { JwtAuthGuard } from '@libs/security/jwt-auth.guard';
import { RbacGuard } from '@libs/rbac/rbac.guard';
import { RequirePermissions } from '@libs/rbac/permissions.decorator';

@Controller('subjects')
@UseGuards(JwtAuthGuard, RbacGuard)
export class SubjectController {
    constructor(private readonly subjectService: SubjectService) { }

    @Get()
    @RequirePermissions('subject.read')
    async findAll(@Req() req: any) {
        return this.subjectService.findAll(req.user.schoolId);
    }

    @Post()
    @RequirePermissions('subject.create')
    async create(@Body() dto: any, @Req() req: any) {
        return this.subjectService.create(req.user.schoolId, dto);
    }

    @Delete(':id')
    @RequirePermissions('subject.delete')
    async remove(@Param('id') id: string, @Req() req: any) {
        return this.subjectService.remove(req.user.schoolId, id);
    }
}
