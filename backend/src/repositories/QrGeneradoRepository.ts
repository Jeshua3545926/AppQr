/**
 * QR Generado Repository - Optimized with caching
 */
import { BaseRepository } from './BaseRepository';
import { QrGenerado } from '../types';
import { qrTokensCache } from '../utils/cache';
import { supabase } from '../config/database';

export class QrGeneradoRepository extends BaseRepository<QrGenerado> {
  constructor() {
    super('qrs_generados', qrTokensCache, 60000); // 1 minute cache
  }

  /**
   * Find by token with caching
   */
  async findByToken(token: string): Promise<QrGenerado | null> {
    const cacheKey = `qr_generado:${token}`;
    
    const cached = qrTokensCache.get(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('qrs_generados')
        .select('id, nombre_local, nombre_empleado, fecha, hora, token')
        .eq('token', token)
        .single();

      if (error || !data) return null;

      qrTokensCache.set(cacheKey, data, 60000);
      return data as QrGenerado;
    } catch (error: any) {
      console.warn('Skipping qrs_generados lookup due to missing table or schema issue:', error?.message || error);
      return null;
    }
  }

  /**
   * Create generated QR - optimized
   */
  async createGenerated(
    nombreLocal: string,
    nombreEmpleado: string,
    fecha: string,
    hora: string,
    token: string
  ): Promise<QrGenerado | null> {
    try {
      const { data, error } = await supabase
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

      if (error || !data) return null;

      // Invalidate cache
      this.invalidateCache();
      
      return data as QrGenerado;
    } catch (error: any) {
      console.warn('Skipping qrs_generados creation due to missing table or schema issue:', error?.message || error);
      return null;
    }
  }
}

export const qrGeneradoRepository = new QrGeneradoRepository();
