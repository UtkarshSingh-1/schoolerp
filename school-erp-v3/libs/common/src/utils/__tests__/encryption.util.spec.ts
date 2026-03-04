import { encrypt, decrypt } from '../encryption.util';

describe('EncryptionUtility', () => {
    const testKey = '0123456789abcdef0123456789abcdef'; // 32 bytes
    process.env.ENCRYPTION_KEY = testKey;

    it('should encrypt and decrypt a string correctly', () => {
        const originalText = 'HelloSecret123';
        const encrypted = encrypt(originalText);

        expect(encrypted).toBeDefined();
        expect(encrypted).toContain(':'); // IV:AuthTag:Data

        const decrypted = decrypt(encrypted);
        expect(decrypted).toBe(originalText);
    });

    it('should return empty string if input is empty', () => {
        expect(encrypt('')).toBe('');
        expect(decrypt('')).toBe('');
    });

    it('should throw error or fail gracefully on tampered data', () => {
        const encrypted = encrypt('SomeData');
        const tampered = encrypted.substring(0, encrypted.length - 5) + 'xxxxx';

        // Decryption of tampered data in GCM should fail final() check
        expect(() => decrypt(tampered)).toThrow();
    });

    it('should produce different ciphertexts for the same plaintext (IV randomness)', () => {
        const text = 'StableText';
        const enc1 = encrypt(text);
        const enc2 = encrypt(text);

        expect(enc1).not.toBe(enc2);
        expect(decrypt(enc1)).toBe(text);
        expect(decrypt(enc2)).toBe(text);
    });
});
