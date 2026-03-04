import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../domain/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
    constructor(private dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }

    async findActiveById(schoolId: string, id: string): Promise<User | null> {
        return this.findOne({
            where: { id, schoolId, isActive: true }
        });
    }

    async findByEmail(schoolId: string, email: string): Promise<User | null> {
        return this.findOne({
            where: { email, schoolId }
        });
    }

    async findOneScoped(schoolId: string, id: string): Promise<User | null> {
        return this.findOne({
            where: { id, schoolId }
        });
    }
}
