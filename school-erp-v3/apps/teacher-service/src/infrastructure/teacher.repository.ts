import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Teacher } from '../domain/teacher.entity';
import { getSchoolId } from '@libs/tenant/tenant.context';

@Injectable()
export class TeacherRepository extends Repository<Teacher> {
    constructor(private dataSource: DataSource) {
        super(Teacher, dataSource.createEntityManager());
    }

    async createTeacher(schoolId: string, teacherData: Partial<Teacher>): Promise<Teacher> {
        const teacher = this.create({
            ...teacherData,
            schoolId: schoolId,
        });
        return this.save(teacher);
    }

    async findBySchool(schoolId: string): Promise<Teacher[]> {
        return this.find({ where: { schoolId } });
    }

    async findOneScoped(schoolId: string, id: string): Promise<Teacher | null> {
        return this.findOne({ where: { id, schoolId } });
    }
}
