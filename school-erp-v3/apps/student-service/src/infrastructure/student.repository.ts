import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Student } from '../domain/student.entity';
import { getSchoolId } from '@libs/tenant/tenant.context';

@Injectable()
export class StudentRepository extends Repository<Student> {
    constructor(private dataSource: DataSource) {
        super(Student, dataSource.createEntityManager());
    }

    // Tenant Isolation Rule: Every query must filter by school_id
    async createStudent(schoolId: string, studentData: Partial<Student>): Promise<Student> {
        const student = this.create({
            ...studentData,
            schoolId: schoolId,
        });
        return this.save(student);
    }

    async findBySchool(schoolId: string): Promise<Student[]> {
        return this.find({ where: { schoolId } });
    }

    async findOneScoped(schoolId: string, id: string): Promise<Student | null> {
        return this.findOne({ where: { id, schoolId } });
    }
}
