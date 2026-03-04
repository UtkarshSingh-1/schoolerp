import { IsString, IsNotEmpty, IsDateString, IsOptional, IsEnum } from 'class-validator';

export class CreateStudentDto {
    @IsString()
    @IsNotEmpty()
    admissionNo: string;

    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsDateString()
    @IsOptional()
    dateOfBirth?: string;

    @IsString()
    @IsOptional()
    gender?: string;

    @IsString()
    @IsNotEmpty()
    parentContact: string;

    @IsOptional()
    @IsString()
    classId?: string;
}
