import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AuditLog } from '../domain/audit-log.entity';
import { getSchoolId } from '@libs/tenant/tenant.context';

@Injectable()
export class AuditRepository extends Repository<AuditLog> {
    constructor(private dataSource: DataSource) {
        super(AuditLog, dataSource.createEntityManager());
    }

    async createLog(schoolId: string, data: Partial<AuditLog>): Promise<AuditLog> {
        const log = this.create({
            ...data,
            schoolId: schoolId,
        });
        return this.save(log);
    }

    async findBySchool(schoolId: string): Promise<AuditLog[]> {
        return this.find({
            where: { schoolId },
            order: { createdAt: 'DESC' }
        });
    }

    async findByUser(schoolId: string, userId: string): Promise<AuditLog[]> {
        return this.find({
            where: { schoolId, userId },
            order: { createdAt: 'DESC' }
        });
    }
}
