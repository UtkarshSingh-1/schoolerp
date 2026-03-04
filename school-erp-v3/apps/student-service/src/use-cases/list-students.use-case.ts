import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Student } from '../domain/student.entity';

@Injectable()
export class ListStudentsUseCase {
    private repository: Repository<Student>;

    constructor(private dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(Student);
    }

    async execute(schoolId: string) {
        return this.repository.find({ where: { schoolId } });
    }
}
