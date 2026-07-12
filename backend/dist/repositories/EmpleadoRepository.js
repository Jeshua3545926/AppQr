"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.empleadoRepository = exports.EmpleadoRepository = void 0;
/**
 * Empleado Repository - Optimized with caching
 */
const BaseRepository_1 = require("./BaseRepository");
const cache_1 = require("../utils/cache");
class EmpleadoRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super('empleado', cache_1.empleadosCache, 60000); // 1 minute cache
    }
    /**
     * Find by name with caching
     */
    async findByNombre(nombre) {
        return this.findByField('nombre', nombre, 'id, nombre, created_at');
    }
    /**
     * Get all employees with minimal fields for performance
     */
    async getAllMinimal() {
        return this.findAll({ limit: 1000, orderBy: 'nombre' }, 'id, nombre');
    }
}
exports.EmpleadoRepository = EmpleadoRepository;
exports.empleadoRepository = new EmpleadoRepository();
//# sourceMappingURL=EmpleadoRepository.js.map