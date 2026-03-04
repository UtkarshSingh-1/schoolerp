import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { tenantStorage } from './tenant.context';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // AUDIT: Single-School System Transition
        // We now enforce a single school ID '66666666-6666-6666-6666-666666666666'
        const schoolId = '66666666-6666-6666-6666-666666666666';

        // Tenant Isolation Rule: Every request must have school context
        tenantStorage.run({ schoolId }, () => {
            next();
        });
    }
}
