import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from config_supabase import SUPABASE_URL, SUPABASE_KEY
from supabase import create_client, Client

# Crear cliente de Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Verificar si existe admin

response = supabase.table('admin').select("*").execute()
response.wait()
admins = response.data

print("Admins existentes:")
for admin in admins:
    print(f"  - Nombre: {admin.get('nombre')}, Password: {admin.get('password')}")

if not admins:
    print("No hay admins en la base de datos.")
    print("Ejecuta este SQL en Supabase para crear uno:")
    print("INSERT INTO admin (nombre, password) VALUES ('admin', 'admin123');")
else:
    print("\nAdmins encontrados. Intenta login con las credenciales mostradas arriba.")
