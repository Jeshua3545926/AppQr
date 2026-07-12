"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localRepository = exports.LocalRepository = void 0;
/**
 * Local Repository - Optimized with caching
 */
const BaseRepository_1 = require("./BaseRepository");
const cache_1 = require("../utils/cache");
class LocalRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super('locales', cache_1.localesCache, 300000); // 5 minutes cache
    }
    /**
     * Find by name with caching
     */
    async findByNombre(nombre) {
        return this.findByField('nombre_local', nombre, 'id, nombre_local, created_at');
    }
    /**
     * Get all locales with minimal fields for performance
     */
    async getAllMinimal() {
        return this.findAll({ limit: 100 }, 'id, nombre_local');
    }
}
exports.LocalRepository = LocalRepository;
exports.localRepository = new LocalRepository();
//# sourceMappingURL=LocalRepository.js.map