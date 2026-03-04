import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTeacherDto {
    @IsString()
    @IsNotEmpty()
    employeeId: string;

    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @IsOptional()
    specialization?: string;
}
