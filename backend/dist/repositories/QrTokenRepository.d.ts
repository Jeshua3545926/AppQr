/**
 * QR Token Repository - Optimized with caching
 */
import { BaseRepository } from './BaseRepository';
import { QrToken } from '../types';
export declare class QrTokenRepository extends BaseRepository<QrToken> {
    constructor();
    /**
     * Find by token with caching
     */
    findByToken(token: string): Promise<QrToken | null>;
    /**
     * Find by employee with caching
     */
    findByEmpleado(empleadoId: string): Promise<QrToken[]>;
    /**
     * Create QR token - optimized
     */
    createToken(empleadoId: string, localId: string, token: string): Promise<QrToken | null>;
}
export declare const qrTokenRepository: QrTokenRepository;
//# sourceMappingURL=QrTokenRepository.d.ts.map