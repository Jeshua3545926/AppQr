"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qrGeneradoRepository = exports.QrGeneradoRepository = void 0;
/**
 * QR Generado Repository - Optimized with caching
 */
const BaseRepository_1 = require("./BaseRepository");
const cache_1 = require("../utils/cache");
const database_1 = require("../config/database");
class QrGeneradoRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super('qrs_generados', cache_1.qrTokensCache, 60000); // 1 minute cache
    }
    /**
     * Find by token with caching
     */
    async findByToken(token) {
        const cacheKey = `qr_generado:${token}`;
        const cached = cache_1.qrTokensCache.get(cacheKey);
        if (cached)
            return cached;
        try {
            const { data, error } = await database_1.supabase
                .from('qrs_generados')
                .select('id, nombre_local, nombre_empleado, fecha, hora, token')
                .eq('token', token)
                .single();
            if (error || !data)
                return null;
            cache_1.qrTokensCache.set(cacheKey, data, 60000);
            return data;
        }
        catch (error) {
            console.warn('Skipping qrs_generados lookup due to missing table or schema issue:', error?.message || error);
            return null;
        }
    }
    /**
     * Create generated QR - optimized
     */
    async createGenerated(nombreLocal, nombreEmpleado, fecha, hora, token) {
        try {
            const { data, error } = await database_1.supabase
                .from('qrs_generados')
                .insert({
                nombre_local: nombreLocal,
                nombre_empleado: nombreEmpleado,
                fecha,
                hora,
                token
            })
                .select('id, nombre_local, nombre_empleado, fecha, hora, token')
                .single();
            if (error || !data)
                return null;
            // Invalidate cache
            this.invalidateCache();
            return data;
        }
        catch (error) {
            console.warn('Skipping qrs_generados creation due to missing table or schema issue:', error?.message || error);
            return null;
        }
    }
}
exports.QrGeneradoRepository = QrGeneradoRepository;
exports.qrGeneradoRepository = new QrGeneradoRepository();
//# sourceMappingURL=QrGeneradoRepository.js.map