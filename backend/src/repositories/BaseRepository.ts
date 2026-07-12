/**
 * Base Repository class for database operations
 * Implements caching, query optimization, and reusability
 */
import { supabase } from '../config/database';
import { empleadosCache, localesCache, registrosCache, qrTokensCache } from '../utils/cache';
import { PaginationParams, PaginatedResponse } from '../types';

export abstract class BaseRepository<T> {
  protected tableName: string;
  protected cache: any;
  protected cacheTTL: number;

  constructor(tableName: string, cache: any, cacheTTL: number = 60000) {
    this.tableName = tableName;
    this.cache = cache;
    this.cacheTTL = cacheTTL;
  }

  /**
   * Find by ID with caching
   */
  async findById(id: string, select: string = '*'): Promise<T | null> {
    const cacheKey = `${this.tableName}:${id}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // Query database
    const { data, error } = await supabase
      .from(this.tableName)
      .select(select)
      .eq('id', id)
      .single();

    if (error || !data) return null;

    // Cache the result
    this.cache.set(cacheKey, data, this.cacheTTL);
    
    return data as T;
  }

  /**
   * Find all with pagination and caching
   */
  async findAll(params: PaginationParams = {}, select: string = '*'): Promise<T[]> {
    const { page = 1, limit = 50, orderBy, ascending = false } = params;
    const cacheKey = `${this.tableName}:all:${page}:${limit}:${orderBy || 'none'}:${ascending}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // Build query with optional ordering
    let query = supabase.from(this.tableName).select(select);
    if (orderBy) {
      query = query.order(orderBy, { ascending });
    }
    const { data, error } = await query.range((page - 1) * limit, page * limit - 1);

    const result = Array.isArray(data) ? data : [];
    if (error) return [] as T[];

    // Cache the result
    this.cache.set(cacheKey, result, this.cacheTTL);
    
    return result as T[];
  }

  /**
   * Find by field with caching
   */
  async findByField(field: string, value: any, select: string = '*'): Promise<T[]> {
    const cacheKey = `${this.tableName}:${field}:${value}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // Query database
    const { data, error } = await supabase
      .from(this.tableName)
      .select(select)
      .eq(field, value);

    if (error) return [];

    // Cache the result
    this.cache.set(cacheKey, data, this.cacheTTL);
    
    return data as T[];
  }

  /**
   * Create new record
   */
  async create(data: Partial<T>, select: string = '*'): Promise<T | null> {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert(data as any)
      .select(select)
      .single();

    if (error || !result) return null;

    // Invalidate relevant cache
    this.cache.clear();

    return result as T;
  }

  /**
   * Update record
   */
  async update(id: string, data: Partial<T>, select: string = '*'): Promise<T | null> {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .update(data as any)
      .eq('id', id)
      .select(select)
      .single();

    if (error || !result) return null;

    // Invalidate cache
    this.cache.delete(`${this.tableName}:${id}`);
    this.cache.clear();

    return result as T;
  }

  /**
   * Delete record
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) return false;

    // Invalidate cache
    this.cache.delete(`${this.tableName}:${id}`);
    this.cache.clear();

    return true;
  }

  /**
   * Count records
   */
  async count(): Promise<number> {
    const { count, error } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });

    if (error) return 0;
    return count || 0;
  }

  /**
   * Batch insert for efficiency
   */
  async batchInsert(data: Partial<T>[]): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .insert(data as any);

    if (error) return false;

    // Invalidate cache
    this.cache.clear();

    return true;
  }

  /**
   * Invalidate all cache for this repository
   */
  invalidateCache(): void {
    this.cache.clear();
  }
}
