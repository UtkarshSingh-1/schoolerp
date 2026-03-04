import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, ip } = request;
        const requestId = request.headers['x-request-id'] || uuidv4();
        const correlationId = request.headers['x-correlation-id'] || requestId;

        // Attach to request for use in controllers/services
        request['requestId'] = requestId;
        request['correlationId'] = correlationId;

        const now = Date.now();
        return next.handle().pipe(
            tap(() => {
                const response = context.switchToHttp().getResponse();
                const { statusCode } = response;
                const delay = Date.now() - now;

                this.logger.log(
                    JSON.stringify({
                        requestId,
                        correlationId,
                        method,
                        url,
                        statusCode,
                        ip,
                        delay: `${delay}ms`,
                        schoolId: request.user?.schoolId,
                        userId: request.user?.id,
                        timestamp: new Date().toISOString()
                    })
                );
            }),
        );
    }
}
