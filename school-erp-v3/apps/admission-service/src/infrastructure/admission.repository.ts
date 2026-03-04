import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Admission } from '../domain/admission.entity';
import { getSchoolId } from '@libs/tenant/tenant.context';

@Injectable()
export class AdmissionRepository extends Repository<Admission> {
    constructor(private dataSource: DataSource) {
        super(Admission, dataSource.createEntityManager());
    }

    async createApplication(schoolId: string, data: Partial<Admission>): Promise<Admission> {
        const application = this.create({
            ...data,
            schoolId: schoolId,
        });
        return this.save(application);
    }

    async findBySchool(schoolId: string): Promise<Admission[]> {
        return this.find({ where: { schoolId } });
    }

    async findOneScoped(schoolId: string, id: string): Promise<Admission | null> {
        return this.findOne({ where: { id, schoolId } });
    }
}
