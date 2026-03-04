import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Class } from '../domain/class.entity';

@Injectable()
export class ClassService {
    private repository: Repository<Class>;

    constructor(private dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(Class);
    }

    async findAll(schoolId: string): Promise<Class[]> {
        return this.repository.find({ where: { schoolId } });
    }

    async create(schoolId: string, data: Partial<Class>): Promise<Class> {
        const cls = this.repository.create({ ...data, schoolId });
        return this.repository.save(cls);
    }

    async update(schoolId: string, id: string, data: Partial<Class>): Promise<Class> {
        await this.repository.update({ id, schoolId }, data);
        return this.repository.findOneByOrFail({ id, schoolId });
    }

    async remove(schoolId: string, id: string): Promise<void> {
        await this.repository.delete({ id, schoolId });
    }
}
