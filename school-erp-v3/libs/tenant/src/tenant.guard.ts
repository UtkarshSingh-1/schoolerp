import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { getSchoolId } from './tenant.context';

@Injectable()
export class TenantGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const schoolId = getSchoolId();

        // CRITICAL: Prevent execution if tenant context is missing in a multi-tenant application
        if (!schoolId) {
            throw new ForbiddenException('Tenant context (x-school-id) is missing or invalid');
        }

        return true;
    }
}
