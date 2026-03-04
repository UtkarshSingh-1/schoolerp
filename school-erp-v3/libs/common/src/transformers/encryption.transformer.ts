import { ValueTransformer } from 'typeorm';
import { encrypt, decrypt } from '../utils/encryption.util';

export class EncryptionTransformer implements ValueTransformer {
    // To: Database
    to(value: string | null): string | null {
        if (!value) return value;
        try {
            return encrypt(value);
        } catch (error) {
            console.error('Encryption failed:', error);
            return value;
        }
    }

    // From: Database
    from(value: string | null): string | null {
        if (!value) return value;
        try {
            return decrypt(value);
        } catch (error) {
            console.error('Decryption failed:', error);
            return value;
        }
    }
}
