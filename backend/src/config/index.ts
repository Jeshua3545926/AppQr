import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'qr_asistencia_secret_key_2024_fixed',
  baseUrl: process.env.BASE_URL || 'http://127.0.0.1:5000',
  

  // Paths
  paths: {
    base: path.resolve(__dirname, '../../'),
    static: path.resolve(__dirname, '../static'),
    qrcodes: path.resolve(__dirname, '../static/qrcodes'),
    pdfs: path.resolve(__dirname, '../static/pdfs')
  }
};

export default config;
