import { Injectable } from '@nestjs/common';
import { TeacherRepository } from '../infrastructure/teacher.repository';
import { Teacher } from '../domain/teacher.entity';

@Injectable()
export class ListTeachersUseCase {
    constructor(private readonly teacherRepository: TeacherRepository) { }

    async execute(schoolId: string): Promise<Teacher[]> {
        return this.teacherRepository.find({ where: { schoolId } });
    }
}
