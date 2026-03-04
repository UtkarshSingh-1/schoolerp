import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import Redis from 'ioredis';

// Core Libraries
import { TenantModule, TenantMiddleware } from '@libs/tenant';
import { RbacModule } from '@libs/rbac';
import { SecurityModule } from '@libs/security';
import { JwtAuthGuard } from '@libs/security/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';

// Service Modules
import { AuthModule } from '@app/auth-service/auth.module';
import { StudentModule } from '@app/student-service/student.module';
import { TeacherModule } from '@app/teacher-service/teacher.module';
import { AdmissionModule } from '@app/admission-service/admission.module';
import { LeaveModule } from '@app/leave-service/leave.module';
import { FinanceModule } from '@app/finance-service/finance.module';
import { NotificationModule } from '@app/notification-service/notification.module';
import { ExamModule } from '@app/exam-service/exam.module';
import { ProctoringModule } from '@app/proctoring-service/proctoring.module';
import { ViolationTrackerModule } from '@app/violation-tracker/violation-tracker.module';
import { AuditModule } from '@app/audit-service/audit.module';
import { RealtimeModule } from '@app/realtime-service/realtime.module';

// Common
import { SystemHealthController } from './common/health.controller';
import { DemoSeederService } from './common/demo-seeder.service';
import { TenantController } from './tenant.controller';
import { DashboardController } from './dashboard.controller';

@Module({
    imports: [
        // Global Config & Infrastructure
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            useFactory: () => {
                const host = process.env.DB_HOST || 'localhost';
                const hostname = process.env.DB_HOSTNAME || host;
                console.error(`[Database] Connecting to ${host} (SNI: ${hostname})`);
                return {
                    type: 'postgres',
                    // url: process.env.DATABASE_URL,
                    host: host,
                    port: parseInt(process.env.DB_PORT) || 5432,
                    username: process.env.DB_USER || 'postgres',
                    password: process.env.DB_PASSWORD || 'postgres',
                    database: process.env.DB_NAME || 'school_erp_v3',
                    autoLoadEntities: true,
                    synchronize: false,
                    logging: false,
                    ssl: {
                        rejectUnauthorized: false,
                        servername: hostname
                    } as any
                };
            }
        }),
        BullModule.forRootAsync({
            useFactory: () => ({
                connection: process.env.USE_REDIS_MOCK !== 'false'
                    ? new (require('ioredis-mock').default || require('ioredis-mock'))()
                    : {
                        host: process.env.REDIS_HOST || 'localhost',
                        port: parseInt(process.env.REDIS_PORT) || 6379,
                        maxRetriesPerRequest: null,
                    },
            }),
        }),

        // Core Libs
        TenantModule,
        RbacModule,
        SecurityModule,

        // Services
        AuthModule,
        StudentModule,
        TeacherModule,
        AdmissionModule,
        LeaveModule,
        FinanceModule,
        NotificationModule,
        ExamModule,
        ProctoringModule,
        ViolationTrackerModule,
        AuditModule,
        RealtimeModule,
    ],
    controllers: [SystemHealthController, TenantController, DashboardController],
    providers: [
        DemoSeederService,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(TenantMiddleware)
            .forRoutes('*');
    }
}
