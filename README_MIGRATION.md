# Sistema QR Asistencia - Migración a Node.js/TypeScript y React/Vite

Este proyecto ha sido migrado de Flask (Python) a Node.js con TypeScript y Express para el backend, y React con Vite para el frontend.

## 📁 Estructura del Proyecto

```
qr_asistencia_mvp_login/
├── backend/                 # Backend Node.js/TypeScript
│   ├── src/
│   │   ├── config/         # Configuración (database, variables de entorno)
│   │   ├── middleware/     # Middleware (autenticación JWT)
│   │   ├── routes/         # Rutas de Express (auth, admin, scanner, api)
│   │   ├── services/       # Lógica de negocio (QR, exportación Excel)
│   │   └── index.ts        # Punto de entrada del servidor
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/               # Frontend React/Vite
│   ├── src/
│   │   ├── context/        # Context API (AuthContext)
│   │   ├── pages/          # Páginas (Login, Admin, Scanner)
│   │   ├── App.tsx         # Componente principal
│   │   ├── main.tsx        # Punto de entrada
│   │   └── index.css       # Estilos globales
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env.example
└── create_supabase_tables.sql  # Script SQL para Supabase
```

## 🚀 Configuración e Instalación

### Prerrequisitos

- Node.js (v18 o superior)
- npm o yarn
- Cuenta de Supabase (base de datos PostgreSQL)

### 1. Configurar Base de Datos (Supabase)

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta el script SQL `create_supabase_tables.sql` en el SQL Editor de Supabase
3. Copia tu `SUPABASE_URL` y `SUPABASE_KEY` del dashboard

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=qr_asistencia_secret_key_2024_fixed
SUPABASE_URL=tu_supabase_url
SUPABASE_KEY=tu_supabase_key
BASE_URL=http://127.0.0.1:5000
```

Iniciar el servidor:

```bash
npm run dev
```

El backend estará disponible en `http://localhost:5000`

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

Edita `.env`:

```env
VITE_API_BASE=http://localhost:5000
```

Iniciar el frontend:

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 🔐 Credenciales por Defecto

**Admin:**
- Usuario: `admin`
- Contraseña: `admin123`

*Nota: Estas credenciales se insertan automáticamente al ejecutar el script SQL.*

## 📋 Funcionalidades Migradas

### Backend (Node.js/Express/TypeScript)
- ✅ Autenticación JWT
- ✅ Rutas de login/logout
- ✅ Panel de administración
- ✅ Generación de códigos QR
- ✅ Escáner de QR
- ✅ Registro de asistencia
- ✅ Exportación a Excel
- ✅ Integración con Supabase

### Frontend (React/Vite)
- ✅ Página de login (admin y empleado)
- ✅ Panel de administración
- ✅ Generador de QR personalizado
- ✅ Escáner de QR con cámara
- ✅ Visualización de registros
- ✅ Descarga de Excel
- ✅ Autenticación con Context API
- ✅ Enrutamiento con React Router
- ✅ Estilos con Tailwind CSS

## 🔧 Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Tipado estático
- **Supabase** - Base de datos y autenticación
- **JWT** - Autenticación con tokens
- **QRCode** - Generación de códigos QR
- **XLSX** - Exportación a Excel

### Frontend
- **React** - Biblioteca UI
- **Vite** - Build tool y servidor de desarrollo
- **TypeScript** - Tipado estático
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Framework CSS
- **html5-qrcode** - Escáner de QR

## 📡 API Endpoints

### Autenticación
- `POST /login` - Iniciar sesión
- `POST /logout` - Cerrar sesión
- `GET /empleados` - Obtener lista de empleados

### Admin
- `GET /admin` - Dashboard admin
- `POST /admin/create-employee` - Crear empleado
- `GET /admin/settings` - Configuración admin
- `POST /admin/settings` - Actualizar configuración
- `GET /admin/descargar-registros` - Descargar Excel
- `POST /admin/generar-qr` - Generar QR personalizado
- `GET /admin/locales` - Obtener locales
- `POST /admin/locales` - Crear local

### Scanner
- `GET /scanner` - Página escáner
- `GET /scanner/scan/:token` - Escanear QR regular
- `GET /scanner/scan_qr_generado/:token` - Escanear QR generado

### API
- `POST /api/registrar_simple` - Registrar asistencia simple
- `POST /api/registrar` - Registrar asistencia con sesión
- `POST /api/registrar_qr_generado_simple` - Registrar QR generado simple
- `POST /api/registrar_qr_generado` - Registrar QR generado con sesión
- `GET /api/registros` - Obtener registros
- `DELETE /api/registros/:id` - Eliminar registro
- `DELETE /api/qr_tokens/:id` - Eliminar QR token
- `GET /api/exportar-empleados` - Exportar empleados
- `POST /api/importar-empleados` - Importar empleados
- `GET /api/locales` - Obtener locales
- `POST /api/locales` - Crear local
- `GET /api/exportar-locales` - Exportar locales
- `POST /api/importar-locales` - Importar locales

## 🛠️ Scripts Disponibles

### Backend
```bash
npm run dev      # Iniciar en modo desarrollo
npm run build    # Compilar TypeScript
npm start        # Iniciar en producción
```

### Frontend
```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Compilar para producción
npm run preview  # Previsualizar build de producción
```

## 📝 Notas Importantes

1. **Base de Datos**: El proyecto utiliza Supabase como base de datos. Asegúrate de configurar las credenciales correctamente en el archivo `.env`.

2. **Variables de Entorno**: Nunca commits el archivo `.env` con credenciales reales. Usa `.env.example` como plantilla.

3. **CORS**: El backend está configurado para aceptar peticiones del frontend en `http://localhost:5173`. Ajusta esto en producción.

4. **Seguridad**: En producción, usa contraseñas fuertes y variables de entorno seguras. Considera implementar hashing de contraseñas con bcrypt.

5. **Archivos Estáticos**: Los archivos QR y PDF se guardan en la carpeta `static` del backend.

## 🚀 Despliegue

### Backend (Producción)
```bash
cd backend
npm run build
npm start
```

### Frontend (Producción)
```bash
cd frontend
npm run build
# Deploy la carpeta 'dist' a tu servicio de hosting
```

## 📄 Licencia

Este proyecto fue desarrollado como solución MVP para control de accesos mediante códigos QR.

---

**Desarrollado por:** Jeshua Garza
**Versión:** 2.0 (Migración a Node.js/TypeScript y React/Vite)
