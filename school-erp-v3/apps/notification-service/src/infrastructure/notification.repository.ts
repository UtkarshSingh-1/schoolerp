import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { NotificationLog } from '../domain/notification-log.entity';
import { getSchoolId } from '../../../../libs/tenant/src/tenant.context';

@Injectable()
export class NotificationRepository extends Repository<NotificationLog> {
    constructor(private dataSource: DataSource) {
        super(NotificationLog, dataSource.createEntityManager());
    }

    async createLog(schoolId: string, data: Partial<NotificationLog>): Promise<NotificationLog> {
        const log = this.create({
            ...data,
            schoolId: schoolId,
        });
        return this.save(log);
    }

    async findBySchool(schoolId: string): Promise<NotificationLog[]> {
        return this.find({ where: { schoolId }, order: { createdAt: 'DESC' } });
    }
}
