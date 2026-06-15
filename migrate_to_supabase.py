# import sys
# from pathlib import Path
# sys.path.insert(0, str(Path(__file__).resolve().parent))

# import sqlite3
# from supabase import create_client, Client
# from config_supabase import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
# from config import DB_PATH
# import hashlib

# # Crear cliente de Supabase
# supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# def hash_password(password):
#     """Hashear contraseña usando SHA256"""
#     return hashlib.sha256(password.encode("utf-8")).hexdigest()

# def migrate_admins():
#     """Migrar tabla admins"""
#     print("Migrando admins...")
#     conn = sqlite3.connect(DB_PATH)
#     conn.row_factory = sqlite3.Row
#     admins = conn.execute("SELECT * FROM admins").fetchall()
    
#     for admin in admins:
#         try:
#             supabase.table('admin').insert({
#                 'id': str(admin['id']) if admin['id'] else None,
#                 'nombre': admin.get('nombre', ''),
#                 'username': admin.get('username', ''),
#                 'password': admin.get('password_hash', ''),
#                 'email': admin.get('email'),
#                 'smtp_host': admin.get('smtp_host'),
#                 'smtp_port': admin.get('smtp_port'),
#                 'smtp_security': admin.get('smtp_security'),
#                 'smtp_email': admin.get('smtp_email'),
#                 'smtp_password': admin.get('smtp_password'),
#                 'admin_email_destino': admin.get('admin_email_destino'),
#                 'sendgrid_api_key': admin.get('sendgrid_api_key')
#             }).execute()
#             print(f"  Admin migrado: {admin.get('username')}")
#         except Exception as e:
#             print(f"  Error migrando admin {admin.get('username')}: {e}")
    
#     conn.close()
#     print("✓ Admins migrados")

# def migrate_empleados():
#     """Migrar tabla empleados"""
#     print("Migrando empleados...")
#     conn = sqlite3.connect(DB_PATH)
#     conn.row_factory = sqlite3.Row
#     empleados = conn.execute("SELECT * FROM empleados").fetchall()
    
#     for emp in empleados:
#         try:
#             supabase.table('empleado').insert({
#                 'id': str(emp['id']) if emp['id'] else None,
#                 'nombre': emp['nombre']
#             }).execute()
#             print(f"  Empleado migrado: {emp['nombre']}")
#         except Exception as e:
#             print(f"  Error migrando empleado {emp['nombre']}: {e}")
    
#     conn.close()
#     print("✓ Empleados migrados")

# def migrate_locales():
#     """Migrar tabla locales"""
#     print("Migrando locales...")
#     conn = sqlite3.connect(DB_PATH)
#     conn.row_factory = sqlite3.Row
#     locales = conn.execute("SELECT * FROM locales").fetchall()
    
#     for local in locales:
#         try:
#             supabase.table('locales').insert({
#                 'id': str(local['id']) if local['id'] else None,
#                 'nombre_local': local['nombre'],
#                 'qr_token': local['qr_token']
#             }).execute()
#             print(f"  Local migrado: {local['nombre']}")
#         except Exception as e:
#             print(f"  Error migrando local {local['nombre']}: {e}")
    
#     conn.close()
#     print("✓ Locales migrados")

# def migrate_qrs_generados():
#     """Migrar tabla qrs_generados"""
#     print("Migrando qrs_generados...")
#     conn = sqlite3.connect(DB_PATH)
#     conn.row_factory = sqlite3.Row
#     qrs = conn.execute("SELECT * FROM qrs_generados").fetchall()
    
#     for qr in qrs:
#         try:
#             supabase.table('qrs_generados').insert({
#                 'id': str(qr['id']) if qr['id'] else None,
#                 'nombre_local': qr['nombre_local'],
#                 'nombre_empleado': qr['nombre_empleado'],
#                 'fecha': qr['fecha'],
#                 'hora': qr['hora'],
#                 'token': qr['token'],
#                 'admin_id': str(qr['admin_id']) if qr['admin_id'] else None,
#                 'creado_en': qr['creado_en'],
#                 'visible': qr['visible'],
#                 'qr_imagen': qr.get('qr_imagen')
#             }).execute()
#             print(f"  QR generado migrado: {qr['token']}")
#         except Exception as e:
#             print(f"  Error migrando QR {qr['token']}: {e}")
    
#     conn.close()
#     print("✓ QRs generados migrados")

# def migrate_registros():
#     """Migrar tabla registros"""
#     print("Migrando registros...")
#     conn = sqlite3.connect(DB_PATH)
#     conn.row_factory = sqlite3.Row
#     registros = conn.execute("SELECT * FROM registros").fetchall()
    
#     for reg in registros:
#         try:
#             supabase.table('registros_asistencia').insert({
#                 'id': str(reg['id']) if reg['id'] else None,
#                 'empleado_id': str(reg['empleado_id']),
#                 'locales_id': str(reg['local_id']),
#                 'fecha_hora': reg['fecha']
#             }).execute()
#             print(f"  Registro migrado: {reg['fecha']}")
#         except Exception as e:
#             print(f"  Error migrando registro {reg['fecha']}: {e}")
    
#     conn.close()
#     print("✓ Registros migrados")

# def main():
#     print("=== Migración de SQLite a Supabase ===")
#     print(f"URL de Supabase: {SUPABASE_URL}")
#     print(f"Base de datos SQLite: {DB_PATH}")
#     print()
    
#     # Verificar conexión con Supabase
#     try:
#         result = supabase.table('empleado').select('count').execute()
#         print("✓ Conexión con Supabase exitosa")
#     except Exception as e:
#         print(f"✗ Error conectando con Supabase: {e}")
#         print("Asegúrate de:")
#         print("1. Haber configurado las credenciales en config_supabase.py")
#         print("2. Haber ejecutado el script create_supabase_tables.sql en Supabase")
#         return
    
#     print()
    
#     # Ejecutar migraciones
#     migrate_admins()
#     migrate_empleados()
#     migrate_locales()
#     migrate_qrs_generados()
#     migrate_registros()
    
#     print()
#     print("=== Migración completada ===")

# if __name__ == "__main__":
#     main()
