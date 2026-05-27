# Sistema MVP QR con login admin único - Flask + SQLite

## Incluye

- Login de administrador
- Solo un usuario admin inicial
- Panel admin protegido
- SQLite
- HTML/CSS/JS
- Escaneo QR con cámara
- QR imprimibles por local
- PDF con todos los QR
- Gmail opcional para avisos
- Historial actualizado cada 5 segundos

## Credenciales demo

```txt
Usuario: admin
Contraseña: admin123
```

Cambia esta contraseña antes de entregar el sistema.

## Instalar

```bash
pip install -r requirements.txt
```

## Ejecutar

```bash
python app.py
```

## Rutas

```txt
http://127.0.0.1:5000/login
http://127.0.0.1:5000/admin
http://127.0.0.1:5000/scanner
http://127.0.0.1:5000/descargar-qrs
```

## Cámara

La cámara funciona en:

```txt
http://127.0.0.1:5000/scanner
```

o con HTTPS cuando lo subas a internet.

No suele funcionar usando una IP local tipo `192.168.x.x` sin HTTPS.

## Cambiar dominio de QR

Cuando subas el sistema, cambia `BASE_URL` en variables de entorno:

```bash
BASE_URL=https://tudominio.com
```

Luego reinicia la app para regenerar los QR con el dominio real.

## Gmail opcional

Configura variables de entorno:

```bash
SMTP_EMAIL=correo_del_sistema@gmail.com
SMTP_APP_PASSWORD=app_password_de_gmail
ADMIN_EMAIL=correo_del_admin@gmail.com
```

Si no configuras Gmail, el sistema guarda registros, pero no manda correo.

## Cambiar contraseña admin

Puedes abrir `database.db` con DB Browser for SQLite y modificar la tabla `admins`.

La contraseña está guardada con SHA256 para este MVP.
Para producción real conviene usar Werkzeug/bcrypt.