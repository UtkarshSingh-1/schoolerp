import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { getSchoolId } from '../../tenant/src/tenant.context';
import { DataSource } from 'typeorm';
import { User } from '@app/auth-service/domain/user.entity';
import { Role } from '@app/auth-service/domain/role.entity';

@Injectable()
export class RbacGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private dataSource: DataSource
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions) {
            return true;
        }

        const { user: jwtUser } = context.switchToHttp().getRequest();

        if (!jwtUser) {
            throw new ForbiddenException('User authentication context is missing. Please ensure JwtAuthGuard is active.');
        }

        const schoolId = getSchoolId();

        // AUDIT FIX: Verify user against DB on every request for real-time deactivation
        const user = await this.dataSource.query(
            `SELECT * FROM users WHERE id = $1 AND school_id = $2 AND is_active = true LIMIT 1`,
            [jwtUser.id, schoolId]
        );

        if (!user || user.length === 0 || !user[0].role_id) {
            throw new ForbiddenException('User is inactive or has no role assigned');
        }

        const role = await this.dataSource.query(
            `SELECT * FROM roles WHERE id = $1 AND school_id = $2 LIMIT 1`,
            [user[0].role_id, schoolId]
        );

        if (!role || role.length === 0) {
            throw new ForbiddenException('User role not found');
        }

        const hasPermission = role[0].permissions?.includes('*') || requiredPermissions.every((permission) =>
            role[0].permissions?.includes(permission)
        );

        if (!hasPermission) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return true;
    }
}
