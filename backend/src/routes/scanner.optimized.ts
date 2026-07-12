/**
 * Optimized Scanner Routes using repositories and caching
 */
import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /scanner - Get attendance page info
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    res.json({ user });
  } catch (error) {
    console.error('Error fetching scanner data:', error);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

export default router;
