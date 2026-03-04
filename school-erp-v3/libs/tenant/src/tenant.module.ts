import { Module, Global, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TenantMiddleware } from './tenant.middleware';
import { TenantGuard } from './tenant.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { School } from './entities/school.entity';
import { TenantService } from './tenant.service';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([School])],
    providers: [TenantGuard, TenantService],
    exports: [TenantGuard, TenantService, TypeOrmModule],
})
export class TenantModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(TenantMiddleware)
            .exclude('health', 'api/v3/health')
            .forRoutes('*');
    }
}
