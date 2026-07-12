"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
/**
 * Base Repository class for database operations
 * Implements caching, query optimization, and reusability
 */
const database_1 = require("../config/database");
class BaseRepository {
    constructor(tableName, cache, cacheTTL = 60000) {
        this.tableName = tableName;
        this.cache = cache;
        this.cacheTTL = cacheTTL;
    }
    /**
     * Find by ID with caching
     */
    async findById(id, select = '*') {
        const cacheKey = `${this.tableName}:${id}`;
        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached)
            return cached;
        // Query database
        const { data, error } = await database_1.supabase
            .from(this.tableName)
            .select(select)
            .eq('id', id)
            .single();
        if (error || !data)
            return null;
        // Cache the result
        this.cache.set(cacheKey, data, this.cacheTTL);
        return data;
    }
    /**
     * Find all with pagination and caching
     */
    async findAll(params = {}, select = '*') {
        const { page = 1, limit = 50, orderBy, ascending = false } = params;
        const cacheKey = `${this.tableName}:all:${page}:${limit}:${orderBy || 'none'}:${ascending}`;
        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached)
            return cached;
        // Build query with optional ordering
        let query = database_1.supabase.from(this.tableName).select(select);
        if (orderBy) {
            query = query.order(orderBy, { ascending });
        }
        const { data, error } = await query.range((page - 1) * limit, page * limit - 1);
        const result = Array.isArray(data) ? data : [];
        if (error)
            return [];
        // Cache the result
        this.cache.set(cacheKey, result, this.cacheTTL);
        return result;
    }
    /**
     * Find by field with caching
     */
    async findByField(field, value, select = '*') {
        const cacheKey = `${this.tableName}:${field}:${value}`;
        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached)
            return cached;
        // Query database
        const { data, error } = await database_1.supabase
            .from(this.tableName)
            .select(select)
            .eq(field, value);
        if (error)
            return [];
        // Cache the result
        this.cache.set(cacheKey, data, this.cacheTTL);
        return data;
    }
    /**
     * Create new record
     */
    async create(data, select = '*') {
        const { data: result, error } = await database_1.supabase
            .from(this.tableName)
            .insert(data)
            .select(select)
            .single();
        if (error || !result)
            return null;
        // Invalidate relevant cache
        this.cache.clear();
        return result;
    }
    /**
     * Update record
     */
    async update(id, data, select = '*') {
        const { data: result, error } = await database_1.supabase
            .from(this.tableName)
            .update(data)
            .eq('id', id)
            .select(select)
            .single();
        if (error || !result)
            return null;
        // Invalidate cache
        this.cache.delete(`${this.tableName}:${id}`);
        this.cache.clear();
        return result;
    }
    /**
     * Delete record
     */
    async delete(id) {
        const { error } = await database_1.supabase
            .from(this.tableName)
            .delete()
            .eq('id', id);
        if (error)
            return false;
        // Invalidate cache
        this.cache.delete(`${this.tableName}:${id}`);
        this.cache.clear();
        return true;
    }
    /**
     * Count records
     */
    async count() {
        const { count, error } = await database_1.supabase
            .from(this.tableName)
            .select('*', { count: 'exact', head: true });
        if (error)
            return 0;
        return count || 0;
    }
    /**
     * Batch insert for efficiency
     */
    async batchInsert(data) {
        const { error } = await database_1.supabase
            .from(this.tableName)
            .insert(data);
        if (error)
            return false;
        // Invalidate cache
        this.cache.clear();
        return true;
    }
    /**
     * Invalidate all cache for this repository
     */
    invalidateCache() {
        this.cache.clear();
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=BaseRepository.js.map