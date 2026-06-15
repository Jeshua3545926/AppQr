import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from supabase import create_client, Client
from config_supabase import SUPABASE_URL, SUPABASE_KEY

# Crear cliente de Supabase (singleton)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_db():
    """Obtener cliente de Supabase"""
    return supabase

def ensure_admin_schema():
    """No necesario en Supabase - las tablas se crean con el script SQL"""
    pass

def ensure_qrs_generados_schema():
    """No necesario en Supabase - las tablas se crean con el script SQL"""
    pass

def ensure_registros_schema():
    """No necesario en Supabase - las tablas se crean con el script SQL"""
    pass