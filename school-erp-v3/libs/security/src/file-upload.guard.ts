import {
    Injectable,
    CanActivate,
    ExecutionContext,
    BadRequestException,
    Inject,
} from '@nestjs/common';
import { StorageService } from '../../storage/src/storage.service';
import { Observable } from 'rxjs';

@Injectable()
export class FileUploadGuard implements CanActivate {
    private readonly whitelist = [
        'image/jpeg',
        'image/png',
        'application/pdf',
    ];
    private readonly maxSize = 5 * 1024 * 1024; // 5MB

    constructor(private readonly storageService: StorageService) { }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const file = request.file;

        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        // 1. Validate MimeType
        if (!this.whitelist.includes(file.mimetype)) {
            throw new BadRequestException(
                `Invalid file type: ${file.mimetype}. Allowed: JPEG, PNG, PDF`,
            );
        }

        // 2. Validate Size
        if (file.size > this.maxSize) {
            throw new BadRequestException(
                `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max allowed: 5MB`,
            );
        }

        // 3. Security: Filename Hashing and Path Normalization
        const schoolId = request.user?.schoolId || 'default';
        const entityType = request.body?.entityType || 'misc';

        // PROOF: This prepares the secure path context for the storage engine
        const hashedName = this.storageService.generateHashedName(file.originalname);
        const securePath = this.storageService.getSecurePath(schoolId, entityType, hashedName);

        request.targetSecurePath = securePath; // Pass to downstream Interceptor/Service

        // 4. (Future) Antivirus Scanning Stub
        // await this.scanFile(file.path);

        return true;
    }
}
