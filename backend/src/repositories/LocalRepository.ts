/**
 * Local Repository - Optimized with caching
 */
import { BaseRepository } from './BaseRepository';
import { Local } from '../types';
import { localesCache } from '../utils/cache';

export class LocalRepository extends BaseRepository<Local> {
  constructor() {
    super('locales', localesCache, 300000); // 5 minutes cache
  }

  /**
   * Find by name with caching
   */
  async findByNombre(nombre: string): Promise<Local[]> {
    return this.findByField('nombre_local', nombre, 'id, nombre_local, created_at');
  }

  /**
   * Get all locales with minimal fields for performance
   */
  async getAllMinimal(): Promise<Local[]> {
    return this.findAll({ limit: 100 }, 'id, nombre_local');
  }
}

export const localRepository = new LocalRepository();
