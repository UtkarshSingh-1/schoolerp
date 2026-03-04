import { IsString, IsNotEmpty, IsLowercase, Matches } from 'class-validator';

export class CreateSchoolDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    @IsLowercase()
    @Matches(/^[a-z0-0-]+$/, { message: 'Subdomain can only contain lowercase letters, numbers, and hyphens' })
    subdomain: string;
}
