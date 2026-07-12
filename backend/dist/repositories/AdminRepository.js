"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRepository = exports.AdminRepository = void 0;
/**
 * Admin Repository - Optimized with caching
 */
const BaseRepository_1 = require("./BaseRepository");
const cache_1 = require("../utils/cache");
class AdminRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super('admin', cache_1.empleadosCache, 300000); // 5 minutes cache
    }
    /**
     * Find by username with caching
     */
    async findByUsername(nombre) {
        const cacheKey = `admin:username:${nombre}`;
        const cached = cache_1.empleadosCache.get(cacheKey);
        if (cached)
            return cached;
        const admins = await this.findByField('nombre', nombre, 'id, nombre, password');
        if (admins.length === 0)
            return null;
        cache_1.empleadosCache.set(cacheKey, admins[0], 300000);
        return admins[0];
    }
    /**
     * Update admin credentials
     */
    async updateCredentials(id, nombre, password) {
        return this.update(id, { nombre, password }, 'id, nombre, password');
    }
}
exports.AdminRepository = AdminRepository;
exports.adminRepository = new AdminRepository();
//# sourceMappingURL=AdminRepository.js.map