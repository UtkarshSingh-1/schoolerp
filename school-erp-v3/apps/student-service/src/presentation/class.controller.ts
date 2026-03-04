import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ClassService } from '../use-cases/class.service';
import { JwtAuthGuard } from '@libs/security/jwt-auth.guard';
import { RbacGuard } from '@libs/rbac/rbac.guard';
import { RequirePermissions } from '@libs/rbac/permissions.decorator';

@Controller('classes')
@UseGuards(JwtAuthGuard, RbacGuard)
export class ClassController {
    constructor(private readonly classService: ClassService) { }

    @Get()
    @RequirePermissions('class.read')
    async findAll(@Req() req: any) {
        return this.classService.findAll(req.user.schoolId);
    }

    @Post()
    @RequirePermissions('class.create')
    async create(@Body() dto: any, @Req() req: any) {
        return this.classService.create(req.user.schoolId, dto);
    }

    @Put(':id')
    @RequirePermissions('class.update')
    async update(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
        return this.classService.update(req.user.schoolId, id, dto);
    }

    @Delete(':id')
    @RequirePermissions('class.delete')
    async remove(@Param('id') id: string, @Req() req: any) {
        return this.classService.remove(req.user.schoolId, id);
    }
}
