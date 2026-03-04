import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
    schoolId: string;
}

export const tenantStorage = new AsyncLocalStorage<TenantContext>();

export function getSchoolId(): string | undefined {
    return tenantStorage.getStore()?.schoolId;
}

export function runWithSchoolId<T>(schoolId: string, fn: () => T): T {
    return tenantStorage.run({ schoolId }, fn);
}
