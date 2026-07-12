import { Router, Request, Response } from 'express';
import { supabase } from '../config/database';
import { generateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  if (req.user?.role === 'admin') {
    return res.redirect('/admin');
  }
  if (req.user?.role === 'user') {
    return res.redirect('/scanner');
  }
  return res.redirect('/login');
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { login_type, username, password, empleado_id } = req.body;

    if (login_type === 'admin') {
      const { data: admins, error } = await supabase
        .from('admin')
        .select('*')
        .eq('nombre', username)
        .eq('password', password);

      if (error) throw error;
      
      if (admins && admins.length > 0) {
        const admin = admins[0];
        const token = generateToken('admin', admin.id, admin.nombre);
        
        res.cookie('jwt_token', token, {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: false
        });
        
        return res.json({ 
          success: true, 
          redirect: '/admin',
          token 
        });
      }

      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    } 
    else if (login_type === 'user') {
      if (!empleado_id) {
        return res.status(400).json({ error: 'Debes seleccionar un empleado' });
      }

      const { data: empleados, error } = await supabase
        .from('empleado')
        .select('*')
        .eq('id', empleado_id);

      if (error) throw error;
      
      if (empleados && empleados.length > 0) {
        const empleado = empleados[0];
        const token = generateToken('user', empleado.id, empleado.nombre);
        
        res.cookie('jwt_token', token, {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: false
        });
        
        return res.json({ 
          success: true, 
          redirect: '/scanner',
          token 
        });
      }

      return res.status(404).json({ error: 'Empleado no válido' });
    }

    return res.status(400).json({ error: 'Selecciona un tipo de inicio de sesión válido' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('jwt_token');
  res.json({ success: true, redirect: '/login' });
});

router.get('/empleados', async (req: Request, res: Response) => {
  try {
    const { data: empleados, error } = await supabase
      .from('empleado')
      .select('*')
      .order('nombre');

    if (error) throw error;
    res.json(empleados || []);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
});

export default router;
