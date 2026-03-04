import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from './entities/school.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TenantService {
    constructor(
        @InjectRepository(School)
        private readonly schoolRepository: Repository<School>
    ) { }

    async createSchool(name: string, subdomain: string): Promise<School> {
        const existing = await this.schoolRepository.findOne({
            where: [{ name }, { subdomain }]
        });

        if (existing) {
            throw new ConflictException('School name or subdomain already exists');
        }

        const school = this.schoolRepository.create({
            id: uuidv4(),
            name,
            subdomain,
            isActive: true
        });

        return this.schoolRepository.save(school);
    }

    async findBySubdomain(subdomain: string): Promise<School | null> {
        return this.schoolRepository.findOne({ where: { subdomain, isActive: true } });
    }

    async findAll(): Promise<School[]> {
        return this.schoolRepository.find();
    }
}
