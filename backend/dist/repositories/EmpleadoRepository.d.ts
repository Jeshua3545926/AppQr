/**
 * Empleado Repository - Optimized with caching
 */
import { BaseRepository } from './BaseRepository';
import { Empleado } from '../types';
export declare class EmpleadoRepository extends BaseRepository<Empleado> {
    constructor();
    /**
     * Find by name with caching
     */
    findByNombre(nombre: string): Promise<Empleado[]>;
    /**
     * Get all employees with minimal fields for performance
     */
    getAllMinimal(): Promise<Empleado[]>;
}
export declare const empleadoRepository: EmpleadoRepository;
//# sourceMappingURL=EmpleadoRepository.d.ts.map