declare class TTLCache<K, V> {
    private cache;
    private maxSize;
    private defaultTTL;
    constructor(maxSize?: number, defaultTTL?: number);
    get(key: K): V | undefined;
    set(key: K, value: V, ttl?: number): void;
    has(key: K): boolean;
    delete(key: K): boolean;
    clear(): void;
    cleanup(): void;
}
export declare const empleadosCache: TTLCache<string, any>;
export declare const localesCache: TTLCache<string, any>;
export declare const registrosCache: TTLCache<string, any>;
export declare const qrTokensCache: TTLCache<string, any>;
export {};
//# sourceMappingURL=cache.d.ts.map