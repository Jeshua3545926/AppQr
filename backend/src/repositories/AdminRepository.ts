/**
 * Admin Repository - Optimized with caching
 */
import { BaseRepository } from './BaseRepository';
import { Admin } from '../types';
import { empleadosCache } from '../utils/cache';

export class AdminRepository extends BaseRepository<Admin> {
  constructor() {
    super('admin', empleadosCache, 300000); // 5 minutes cache
  }

  /**
   * Find by username with caching
   */
  async findByUsername(nombre: string): Promise<Admin | null> {
    const cacheKey = `admin:username:${nombre}`;
    
    const cached = empleadosCache.get(cacheKey);
    if (cached) return cached;

    const admins = await this.findByField('nombre', nombre, 'id, nombre, password');
    if (admins.length === 0) return null;

    empleadosCache.set(cacheKey, admins[0], 300000);
    return admins[0];
  }

  /**
   * Update admin credentials
   */
  async updateCredentials(id: string, nombre: string, password: string): Promise<Admin | null> {
    return this.update(id, { nombre, password }, 'id, nombre, password');
  }
}

export const adminRepository = new AdminRepository();
