import { IsString, IsEmail, IsNotEmpty, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class CreateManualStudentDto {
    @IsString()
    @IsNotEmpty()
    firstName!: string;

    @IsString()
    @IsNotEmpty()
    lastName!: string;

    @IsEmail()
    email!: string;

    @IsUUID()
    classId!: string;

    @IsString()
    @IsNotEmpty()
    parentContact!: string;

    @IsString()
    @IsOptional()
    gender?: string;

    @IsOptional()
    @IsBoolean()
    autoAssignFee?: boolean;
}
