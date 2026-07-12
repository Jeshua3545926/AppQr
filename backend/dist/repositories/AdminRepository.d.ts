/**
 * Admin Repository - Optimized with caching
 */
import { BaseRepository } from './BaseRepository';
import { Admin } from '../types';
export declare class AdminRepository extends BaseRepository<Admin> {
    constructor();
    /**
     * Find by username with caching
     */
    findByUsername(nombre: string): Promise<Admin | null>;
    /**
     * Update admin credentials
     */
    updateCredentials(id: string, nombre: string, password: string): Promise<Admin | null>;
}
export declare const adminRepository: AdminRepository;
//# sourceMappingURL=AdminRepository.d.ts.map