/**
 * QR Generado Repository - Optimized with caching
 */
import { BaseRepository } from './BaseRepository';
import { QrGenerado } from '../types';
export declare class QrGeneradoRepository extends BaseRepository<QrGenerado> {
    constructor();
    /**
     * Find by token with caching
     */
    findByToken(token: string): Promise<QrGenerado | null>;
    /**
     * Create generated QR - optimized
     */
    createGenerated(nombreLocal: string, nombreEmpleado: string, fecha: string, hora: string, token: string): Promise<QrGenerado | null>;
}
export declare const qrGeneradoRepository: QrGeneradoRepository;
//# sourceMappingURL=QrGeneradoRepository.d.ts.map