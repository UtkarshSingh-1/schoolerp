import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ViolationRecord } from '../domain/violation-record.entity';
import { getSchoolId } from '../../../../libs/tenant/src/tenant.context';

@Injectable()
export class ViolationRepository extends Repository<ViolationRecord> {
    constructor(private dataSource: DataSource) {
        super(ViolationRecord, dataSource.createEntityManager());
    }

    async createRecord(schoolId: string, data: Partial<ViolationRecord>): Promise<ViolationRecord> {
        const record = this.create({
            ...data,
            schoolId: schoolId,
        });
        return this.save(record);
    }

    async findBySchool(schoolId: string): Promise<ViolationRecord[]> {
        return this.find({ where: { schoolId }, order: { createdAt: 'DESC' } });
    }

    async findByStudent(schoolId: string, studentId: string): Promise<ViolationRecord[]> {
        return this.find({
            where: { schoolId, studentId },
            order: { createdAt: 'DESC' }
        });
    }
}
