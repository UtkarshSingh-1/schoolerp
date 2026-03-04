import { IsString, IsNotEmpty, IsEmail, IsUUID, IsOptional } from 'class-validator';

export class SubmitApplicationDto {
    @IsString()
    @IsNotEmpty()
    applicantFullName: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsUUID()
    @IsNotEmpty()
    targetClassId: string;

    @IsOptional()
    metadata?: any;
}
