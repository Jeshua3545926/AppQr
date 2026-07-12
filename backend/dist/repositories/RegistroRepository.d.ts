/**
 * Registro Asistencia Repository - Optimized with caching
 */
import { BaseRepository } from './BaseRepository';
import { RegistroAsistencia } from '../types';
export declare class RegistroRepository extends BaseRepository<RegistroAsistencia> {
    constructor();
    /**
     * Get recent records with employee and locale names (optimized join)
     */
    getRecentWithNames(limit?: number): Promise<any[]>;
    /**
     * Get records by employee with pagination
     */
    getByEmpleado(empleadoId: string, page?: number, limit?: number): Promise<RegistroAsistencia[]>;
    /**
     * Get records by date range
     */
    getByDateRange(startDate: string, endDate: string, page?: number, limit?: number): Promise<RegistroAsistencia[]>;
    /**
     * Register attendance - optimized single query
     */
    registerAttendance(empleadoId: string, localId: string, observaciones?: string): Promise<RegistroAsistencia | null>;
}
export declare const registroRepository: RegistroRepository;
//# sourceMappingURL=RegistroRepository.d.ts.map