import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { TenantService, CreateSchoolDto } from '@libs/tenant';
import { RbacGuard, RequirePermissions } from '@libs/rbac';
import { JwtAuthGuard } from '@libs/security';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RbacGuard)
export class TenantController {
    constructor(private readonly tenantService: TenantService) { }

    @Post()
    @RequirePermissions('system.manage_tenants')
    async create(@Body() dto: CreateSchoolDto) {
        return this.tenantService.createSchool(dto.name, dto.subdomain);
    }

    @Get()
    @RequirePermissions('system.manage_tenants')
    async findAll() {
        return this.tenantService.findAll();
    }
}
