import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Subject } from '../domain/subject.entity';

@Injectable()
export class SubjectService {
    private repository: Repository<Subject>;

    constructor(private dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(Subject);
    }

    async findAll(schoolId: string): Promise<Subject[]> {
        return this.repository.find({ where: { schoolId } });
    }

    async create(schoolId: string, data: Partial<Subject>): Promise<Subject> {
        const sub = this.repository.create({ ...data, schoolId });
        return this.repository.save(sub);
    }

    async remove(schoolId: string, id: string): Promise<void> {
        await this.repository.delete({ id, schoolId });
    }
}
