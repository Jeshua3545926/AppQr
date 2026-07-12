/**
 * Local Repository - Optimized with caching
 */
import { BaseRepository } from './BaseRepository';
import { Local } from '../types';
export declare class LocalRepository extends BaseRepository<Local> {
    constructor();
    /**
     * Find by name with caching
     */
    findByNombre(nombre: string): Promise<Local[]>;
    /**
     * Get all locales with minimal fields for performance
     */
    getAllMinimal(): Promise<Local[]>;
}
export declare const localRepository: LocalRepository;
//# sourceMappingURL=LocalRepository.d.ts.map