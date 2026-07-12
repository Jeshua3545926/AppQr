import { Router, Request, Response } from 'express';
import { supabase } from '../config/database';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { data: empleados, error } = await supabase
      .from('empleado')
      .select('*')
      .order('nombre');

    if (error) throw error;

    res.json({
      empleados: empleados || [],
      selected_user_id: req.user?.user_id,
      selected_user_name: req.user?.username,
      role: req.user?.role
    });
  } catch (error) {
    console.error('Scanner error:', error);
    res.status(500).json({ error: 'Error al cargar datos' });
  }
});

router.get('/scan/:token', async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.params;

    const { data: locales, error } = await supabase
      .from('locales')
      .select('*')
      .eq('qr_token', token);

    if (error) throw error;

    if (!locales || locales.length === 0) {
      return res.status(404).json({ error: 'QR inválido' });
    }

    const local = locales[0];

    // If user is logged in as employee, auto-register
    if (req.user?.role === 'user' && req.user?.user_id) {
      const empleado_id = req.user.user_id;
      const fecha = new Date().toISOString();

      const { error: insertError } = await supabase
        .from('registros_asistencia')
        .insert({
          empleado_id,
          locales_id: local.id,
          fecha_hora: fecha
        });

      if (insertError) throw insertError;

      return res.json({
        success: true,
        mensaje: `${req.user.username} registró llegada/recolección en ${local.nombre_local}`,
        fecha
      });
    }

    // Get employees for manual selection
    const { data: empleados } = await supabase
      .from('empleado')
      .select('*')
      .order('nombre');

    res.json({
      local,
      empleados: empleados || []
    });
  } catch (error) {
    console.error('Scan token error:', error);
    res.status(500).json({ error: 'Error al procesar QR' });
  }
});

router.get('/scan_qr_generado/:token', async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.params;

    const { data: qrs, error } = await supabase
      .from('qr_tokens')
      .select('*')
      .eq('token', token);

    if (error) throw error;

    if (!qrs || qrs.length === 0) {
      return res.status(404).json({ error: 'QR inválido' });
    }

    const qr_generado = qrs[0];

    // If user is logged in as employee, auto-register
    if (req.user?.role === 'user' && req.user?.user_id) {
      const empleado_id = req.user.user_id;
      const fecha = new Date().toISOString();

      // Check if local exists, if not create it
      const { data: locales } = await supabase
        .from('locales')
        .select('*')
        .eq('nombre_local', qr_generado.nombre_local);

      let local_id: string;
      
      if (!locales || locales.length === 0) {
        // Create local
        const { data: new_local } = await supabase
          .from('locales')
          .insert({
            nombre_local: qr_generado.nombre_local,
            qr_token: token
          })
          .select()
          .single();
        
        local_id = new_local.id;
      } else {
        local_id = locales[0].id;
      }

      // Register attendance
      const { error: insertError } = await supabase
        .from('registros_asistencia')
        .insert({
          empleado_id,
          locales_id: local_id,
          fecha_hora: fecha,
          token_id: qr_generado.id
        });

      if (insertError) throw insertError;

      return res.json({
        success: true,
        mensaje: `${req.user.username} registró QR personalizado: ${qr_generado.nombre_local} - ${qr_generado.nombre_empleado}`,
        fecha
      });
    }

    // Get employees for manual selection
    const { data: empleados } = await supabase
      .from('empleado')
      .select('*')
      .order('nombre');

    res.json({
      qr_generado,
      empleados: empleados || []
    });
  } catch (error) {
    console.error('Scan generated QR error:', error);
    res.status(500).json({ error: 'Error al procesar QR' });
  }
});

export default router;
