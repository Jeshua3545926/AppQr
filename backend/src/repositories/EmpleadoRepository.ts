/**
 * Empleado Repository - Optimized with caching
 */
import { BaseRepository } from './BaseRepository';
import { Empleado } from '../types';
import { empleadosCache } from '../utils/cache';

export class EmpleadoRepository extends BaseRepository<Empleado> {
  constructor() {
    super('empleado', empleadosCache, 60000); // 1 minute cache
  }

  /**
   * Find by name with caching
   */
  async findByNombre(nombre: string): Promise<Empleado[]> {
    return this.findByField('nombre', nombre, 'id, nombre, created_at');
  }

  /**
   * Get all employees with minimal fields for performance
   */
  async getAllMinimal(): Promise<Empleado[]> {
    return this.findAll({ limit: 1000, orderBy: 'nombre' }, 'id, nombre');
  }
}

export const empleadoRepository = new EmpleadoRepository();
