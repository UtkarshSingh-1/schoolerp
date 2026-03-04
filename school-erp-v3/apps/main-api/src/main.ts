import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DemoSeederService } from './common/demo-seeder.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global Prefix
    app.setGlobalPrefix('api/v3');

    // Global Validation
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));

    // Security Polish: Helmet & CORS
    app.use(helmet());
    app.enableCors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    // Swagger Documentation
    const config = new DocumentBuilder()
        .setTitle('School ERP v3.0 - Modular Multi-Tenant API')
        .setDescription('Unified API documentation for all ERP microservices')
        .setVersion('3.0.1')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`[ERP-V3] Master API is running on: http://localhost:${port}/api/v3`);
    console.log(`[ERP-V3] Documentation available at: http://localhost:${port}/docs`);
}
bootstrap();
