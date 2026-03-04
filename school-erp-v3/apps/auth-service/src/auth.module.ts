import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './domain/user.entity';
import { Role } from './domain/role.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from './infrastructure/user.repository';
import { SecurityModule } from '@libs/security/security.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Role]),
        ConfigModule.forRoot(),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET') || 'super-secret',
                signOptions: { expiresIn: '1h' },
            }),
        }),
        SecurityModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, UserRepository],
    exports: [AuthService, UserRepository],
})
export class AuthModule { }
