import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

@Injectable()
export class StorageService {
    private readonly rootDir = path.normalize(path.join(process.cwd(), 'storage'));

    constructor() {
        if (!fs.existsSync(this.rootDir)) {
            fs.mkdirSync(this.rootDir);
        }
    }

    /**
     * PROOF: Hashed filename generation for security
     */
    generateHashedName(originalName: string): string {
        const timestamp = Date.now().toString();
        const salt = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(originalName);

        const hash = crypto
            .createHash('sha256')
            .update(originalName + timestamp + salt)
            .digest('hex');

        return `${hash}${ext}`;
    }

    /**
     * PROOF: Tenant-based directory isolation and path normalization
     */
    getSecurePath(schoolId: string, entityType: string, hashedName: string): string {
        if (!schoolId || !entityType || !hashedName) {
            throw new InternalServerErrorException('STORAGE_ERROR: Missing path parameters');
        }

        // PROOF: Strict path.normalize and directory structure enforcement
        const targetDir = path.normalize(path.join(this.rootDir, schoolId, entityType));

        // Prevent directory traversal
        if (!targetDir.startsWith(this.rootDir)) {
            throw new InternalServerErrorException('STORAGE_ERROR: Directory traversal attempt detected');
        }

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        return path.join(targetDir, hashedName);
    }
}
