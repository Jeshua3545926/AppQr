"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportEmpleadosToExcel = exportEmpleadosToExcel;
exports.importEmpleadosFromExcel = importEmpleadosFromExcel;
exports.exportLocalesToExcel = exportLocalesToExcel;
exports.importLocalesFromExcel = importLocalesFromExcel;
const database_1 = require("../config/database");
const XLSX = __importStar(require("xlsx"));
async function exportEmpleadosToExcel() {
    try {
        const { data: empleados, error } = await database_1.supabase
            .from('empleado')
            .select('*')
            .order('nombre');
        if (error)
            throw error;
        const worksheet = XLSX.utils.json_to_sheet(empleados || []);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Empleados');
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        return excelBuffer;
    }
    catch (error) {
        console.error('Error exporting empleados:', error);
        throw new Error('Error al exportar empleados');
    }
}
async function importEmpleadosFromExcel(buffer) {
    try {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);
        for (const row of data) {
            if (row.nombre) {
                await database_1.supabase
                    .from('empleado')
                    .insert({ nombre: row.nombre });
            }
        }
    }
    catch (error) {
        console.error('Error importing empleados:', error);
        throw new Error('Error al importar empleados');
    }
}
async function exportLocalesToExcel() {
    try {
        const { data: locales, error } = await database_1.supabase
            .from('locales')
            .select('*')
            .order('nombre_local');
        if (error)
            throw error;
        const worksheet = XLSX.utils.json_to_sheet(locales || []);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Locales');
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        return excelBuffer;
    }
    catch (error) {
        console.error('Error exporting locales:', error);
        throw new Error('Error al exportar locales');
    }
}
async function importLocalesFromExcel(buffer) {
    try {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);
        for (const row of data) {
            if (row.nombre_local) {
                await database_1.supabase
                    .from('locales')
                    .insert({ nombre_local: row.nombre_local });
            }
        }
    }
    catch (error) {
        console.error('Error importing locales:', error);
        throw new Error('Error al importar locales');
    }
}
//# sourceMappingURL=exportService.js.map