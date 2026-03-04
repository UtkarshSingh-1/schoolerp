import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { LeaveRequest } from '../domain/leave-request.entity';
import { getSchoolId } from '@libs/tenant/tenant.context';

@Injectable()
export class LeaveRepository extends Repository<LeaveRequest> {
    constructor(private dataSource: DataSource) {
        super(LeaveRequest, dataSource.createEntityManager());
    }

    async createLeaveRequest(schoolId: string, data: Partial<LeaveRequest>): Promise<LeaveRequest> {
        const leaveRequest = this.create({
            ...data,
            schoolId: schoolId,
        });
        return this.save(leaveRequest);
    }

    async findBySchool(schoolId: string): Promise<LeaveRequest[]> {
        return this.find({ where: { schoolId } });
    }

    async findOneScoped(schoolId: string, id: string): Promise<LeaveRequest | null> {
        return this.findOne({ where: { id, schoolId } });
    }
}
