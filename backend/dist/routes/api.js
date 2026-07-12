"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const exportService_1 = require("../services/exportService");
const router = (0, express_1.Router)();
// Register attendance (simple version)
router.post('/registrar_simple', async (req, res) => {
    try {
        const { empleado_id, qr_token, observaciones } = req.body;
        if (!empleado_id || !qr_token) {
            return res.status(400).json({ ok: false, error: 'Falta empleado o QR' });
        }
        const { data: locales, error: localError } = await database_1.supabase
            .from('locales')
            .select('*')
            .eq('qr_token', qr_token);
        if (localError)
            throw localError;
        if (!locales || locales.length === 0) {
            return res.status(404).json({ ok: false, error: 'QR inválido' });
        }
        const local = locales[0];
        const { data: empleados, error: empError } = await database_1.supabase
            .from('empleado')
            .select('*')
            .eq('id', empleado_id);
        if (empError)
            throw empError;
        if (!empleados || empleados.length === 0) {
            return res.status(404).json({ ok: false, error: 'Empleado inválido' });
        }
        const empleado = empleados[0];
        const fecha = new Date().toISOString();
        const { error: insertError } = await database_1.supabase
            .from('registros_asistencia')
            .insert({
            empleado_id,
            locales_id: local.id,
            fecha_hora: fecha,
            observaciones: observaciones || ''
        });
        if (insertError)
            throw insertError;
        res.json({
            ok: true,
            mensaje: `${empleado.nombre} registró llegada/recolección en ${local.nombre_local}`,
            empleado: empleado.nombre,
            local: local.nombre_local,
            fecha
        });
    }
    catch (error) {
        console.error('Registrar simple error:', error);
        res.status(500).json({ ok: false, error: 'Error en el servidor' });
    }
});
// Register attendance (with session support)
router.post('/registrar', async (req, res) => {
    try {
        let { empleado_id, qr_token } = req.body;
        if (!empleado_id && req.user?.role === 'user') {
            empleado_id = req.user.user_id;
        }
        if (!empleado_id || !qr_token) {
            return res.status(400).json({ ok: false, error: 'Falta empleado o QR' });
        }
        const { data: locales, error: localError } = await database_1.supabase
            .from('locales')
            .select('*')
            .eq('qr_token', qr_token);
        if (localError)
            throw localError;
        if (!locales || locales.length === 0) {
            return res.status(404).json({ ok: false, error: 'QR inválido' });
        }
        const local = locales[0];
        const { data: empleados, error: empError } = await database_1.supabase
            .from('empleado')
            .select('*')
            .eq('id', empleado_id);
        if (empError)
            throw empError;
        if (!empleados || empleados.length === 0) {
            return res.status(404).json({ ok: false, error: 'Empleado inválido' });
        }
        const empleado = empleados[0];
        const fecha = new Date().toISOString();
        const { error: insertError } = await database_1.supabase
            .from('registros_asistencia')
            .insert({
            empleado_id,
            locales_id: local.id,
            fecha_hora: fecha
        });
        if (insertError)
            throw insertError;
        res.json({
            ok: true,
            mensaje: `${empleado.nombre} registró llegada/recolección en ${local.nombre_local}`,
            empleado: empleado.nombre,
            local: local.nombre_local,
            fecha
        });
    }
    catch (error) {
        console.error('Registrar error:', error);
        res.status(500).json({ ok: false, error: 'Error en el servidor' });
    }
});
// Register generated QR (simple version)
router.post('/registrar_qr_generado_simple', async (req, res) => {
    try {
        const { empleado_id, qr_token } = req.body;
        if (!empleado_id || !qr_token) {
            return res.status(400).json({ ok: false, error: 'Falta empleado o QR' });
        }
        const { data: qrs, error: qrError } = await database_1.supabase
            .from('qr_tokens')
            .select('*')
            .eq('token', qr_token);
        if (qrError)
            throw qrError;
        if (!qrs || qrs.length === 0) {
            return res.status(404).json({ ok: false, error: 'QR inválido' });
        }
        const qr_generado = qrs[0];
        const { data: empleados, error: empError } = await database_1.supabase
            .from('empleado')
            .select('*')
            .eq('id', empleado_id);
        if (empError)
            throw empError;
        if (!empleados || empleados.length === 0) {
            return res.status(404).json({ ok: false, error: 'Empleado inválido' });
        }
        const empleado = empleados[0];
        const fecha = new Date().toISOString();
        // Check if local exists
        const { data: locales } = await database_1.supabase
            .from('locales')
            .select('*')
            .eq('nombre_local', qr_generado.nombre_local);
        let local_id;
        if (!locales || locales.length === 0) {
            // Create local
            const { data: new_local } = await database_1.supabase
                .from('locales')
                .insert({
                nombre_local: qr_generado.nombre_local,
                qr_token: qr_token
            })
                .select()
                .single();
            local_id = new_local.id;
        }
        else {
            local_id = locales[0].id;
        }
        const { error: insertError } = await database_1.supabase
            .from('registros_asistencia')
            .insert({
            empleado_id,
            locales_id: local_id,
            fecha_hora: fecha,
            token_id: qr_generado.id
        });
        if (insertError)
            throw insertError;
        res.json({
            ok: true,
            mensaje: `${empleado.nombre} registró QR personalizado: ${qr_generado.nombre_local} - ${qr_generado.nombre_empleado}`,
            empleado: empleado.nombre,
            local: qr_generado.nombre_local,
            empleado_qr: qr_generado.nombre_empleado,
            fecha_qr: qr_generado.fecha,
            hora_qr: qr_generado.hora,
            fecha
        });
    }
    catch (error) {
        console.error('Registrar QR generado simple error:', error);
        res.status(500).json({ ok: false, error: 'Error en el servidor' });
    }
});
// Register generated QR (with session support)
router.post('/registrar_qr_generado', async (req, res) => {
    try {
        let { empleado_id, qr_token } = req.body;
        if (!empleado_id && req.user?.role === 'user') {
            empleado_id = req.user.user_id;
        }
        if (!empleado_id || !qr_token) {
            return res.status(400).json({ ok: false, error: 'Falta empleado o QR' });
        }
        const { data: qrs, error: qrError } = await database_1.supabase
            .from('qr_tokens')
            .select('*')
            .eq('token', qr_token);
        if (qrError)
            throw qrError;
        if (!qrs || qrs.length === 0) {
            return res.status(404).json({ ok: false, error: 'QR inválido' });
        }
        const qr_generado = qrs[0];
        const { data: empleados, error: empError } = await database_1.supabase
            .from('empleado')
            .select('*')
            .eq('id', empleado_id);
        if (empError)
            throw empError;
        if (!empleados || empleados.length === 0) {
            return res.status(404).json({ ok: false, error: 'Empleado inválido' });
        }
        const empleado = empleados[0];
        const fecha = new Date().toISOString();
        // Check if local exists
        const { data: locales } = await database_1.supabase
            .from('locales')
            .select('*')
            .eq('nombre_local', qr_generado.nombre_local);
        let local_id;
        if (!locales || locales.length === 0) {
            // Create local
            const { data: new_local } = await database_1.supabase
                .from('locales')
                .insert({
                nombre_local: qr_generado.nombre_local,
                qr_token: qr_token
            })
                .select()
                .single();
            local_id = new_local.id;
        }
        else {
            local_id = locales[0].id;
        }
        const { error: insertError } = await database_1.supabase
            .from('registros_asistencia')
            .insert({
            empleado_id,
            locales_id: local_id,
            fecha_hora: fecha,
            token_id: qr_generado.id
        });
        if (insertError)
            throw insertError;
        res.json({
            ok: true,
            mensaje: `${empleado.nombre} registró QR personalizado: ${qr_generado.nombre_local} - ${qr_generado.nombre_empleado}`,
            empleado: empleado.nombre,
            local: qr_generado.nombre_local,
            empleado_qr: qr_generado.nombre_empleado,
            fecha_qr: qr_generado.fecha,
            hora_qr: qr_generado.hora,
            fecha
        });
    }
    catch (error) {
        console.error('Registrar QR generado error:', error);
        res.status(500).json({ ok: false, error: 'Error en el servidor' });
    }
});
// Get attendance records
router.get('/registros', async (req, res) => {
    try {
        const { data: registros_raw, error } = await database_1.supabase
            .from('registros_asistencia')
            .select('*')
            .order('fecha_hora', { ascending: false })
            .limit(20);
        if (error)
            throw error;
        const registros = await Promise.all((registros_raw || []).map(async (reg) => {
            const { data: empleado } = await database_1.supabase
                .from('empleado')
                .select('nombre')
                .eq('id', reg.empleado_id)
                .single();
            const { data: local } = await database_1.supabase
                .from('locales')
                .select('nombre_local')
                .eq('id', reg.locales_id)
                .single();
            return {
                id: reg.id,
                empleado: empleado?.nombre || 'Desconocido',
                local: local?.nombre_local || 'Desconocido',
                fecha: reg.fecha_hora,
                observaciones: reg.observaciones || ''
            };
        }));
        res.json(registros);
    }
    catch (error) {
        console.error('Get registros error:', error);
        res.status(500).json({ error: 'Error al obtener registros' });
    }
});
// Delete attendance record
router.delete('/registros/:registro_id', async (req, res) => {
    try {
        const { registro_id } = req.params;
        const { error } = await database_1.supabase
            .from('registros_asistencia')
            .delete()
            .eq('id', registro_id);
        if (error)
            throw error;
        res.json({ ok: true, message: 'Registro eliminado' });
    }
    catch (error) {
        console.error('Delete registro error:', error);
        res.status(500).json({ ok: false, error: 'Error al eliminar registro' });
    }
});
// Delete QR token
router.delete('/qr_tokens/:qr_id', async (req, res) => {
    try {
        const { qr_id } = req.params;
        const { error } = await database_1.supabase
            .from('qr_tokens')
            .delete()
            .eq('id', qr_id);
        if (error)
            throw error;
        res.json({ ok: true, message: 'QR eliminado' });
    }
    catch (error) {
        console.error('Delete QR error:', error);
        res.status(500).json({ ok: false, error: 'Error al eliminar QR' });
    }
});
// Export employees
router.get('/exportar-empleados', async (req, res) => {
    try {
        const excelBuffer = await (0, exportService_1.exportEmpleadosToExcel)();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=empleados.xlsx');
        res.send(excelBuffer);
    }
    catch (error) {
        console.error('Export empleados error:', error);
        res.status(500).json({ error: 'Error al exportar empleados' });
    }
});
// Import employees
router.post('/importar-empleados', async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ ok: false, message: 'No se envió ningún archivo' });
        }
        await (0, exportService_1.importEmpleadosFromExcel)(file.buffer);
        res.json({ ok: true, message: 'Empleados importados' });
    }
    catch (error) {
        console.error('Import empleados error:', error);
        res.status(500).json({ ok: false, error: 'Error al importar empleados' });
    }
});
// Locales endpoints
router.get('/locales', async (req, res) => {
    try {
        const { data: locales, error } = await database_1.supabase
            .from('locales')
            .select('*');
        if (error)
            throw error;
        res.json(locales || []);
    }
    catch (error) {
        console.error('Get locales error:', error);
        res.status(500).json({ error: 'Error al obtener locales' });
    }
});
router.post('/locales', async (req, res) => {
    try {
        const { nombre_local } = req.body;
        if (!nombre_local) {
            return res.status(400).json({ ok: false, message: 'Nombre del local es requerido' });
        }
        const { error } = await database_1.supabase
            .from('locales')
            .insert({ nombre_local });
        if (error)
            throw error;
        res.json({ ok: true, message: 'Local agregado correctamente' });
    }
    catch (error) {
        console.error('Create local error:', error);
        res.status(500).json({ ok: false, error: 'Error al agregar local' });
    }
});
// Export locales
router.get('/exportar-locales', async (req, res) => {
    try {
        const excelBuffer = await (0, exportService_1.exportLocalesToExcel)();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=locales.xlsx');
        res.send(excelBuffer);
    }
    catch (error) {
        console.error('Export locales error:', error);
        res.status(500).json({ error: 'Error al exportar locales' });
    }
});
// Import locales
router.post('/importar-locales', async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ ok: false, message: 'No se envió ningún archivo' });
        }
        await (0, exportService_1.importLocalesFromExcel)(file.buffer);
        res.json({ ok: true, message: 'Locales importados' });
    }
    catch (error) {
        console.error('Import locales error:', error);
        res.status(500).json({ ok: false, error: 'Error al importar locales' });
    }
});
exports.default = router;
//# sourceMappingURL=api.js.map