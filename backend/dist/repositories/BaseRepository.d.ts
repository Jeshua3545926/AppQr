import { PaginationParams } from '../types';
export declare abstract class BaseRepository<T> {
    protected tableName: string;
    protected cache: any;
    protected cacheTTL: number;
    constructor(tableName: string, cache: any, cacheTTL?: number);
    /**
     * Find by ID with caching
     */
    findById(id: string, select?: string): Promise<T | null>;
    /**
     * Find all with pagination and caching
     */
    findAll(params?: PaginationParams, select?: string): Promise<T[]>;
    /**
     * Find by field with caching
     */
    findByField(field: string, value: any, select?: string): Promise<T[]>;
    /**
     * Create new record
     */
    create(data: Partial<T>, select?: string): Promise<T | null>;
    /**
     * Update record
     */
    update(id: string, data: Partial<T>, select?: string): Promise<T | null>;
    /**
     * Delete record
     */
    delete(id: string): Promise<boolean>;
    /**
     * Count records
     */
    count(): Promise<number>;
    /**
     * Batch insert for efficiency
     */
    batchInsert(data: Partial<T>[]): Promise<boolean>;
    /**
     * Invalidate all cache for this repository
     */
    invalidateCache(): void;
}
//# sourceMappingURL=BaseRepository.d.ts.map