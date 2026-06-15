import os

# Supabase Configuration
# Obtén estas credenciales desde tu dashboard de Supabase:
# https://supabase.com/dashboard/project/_/settings/api

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://fwfnniumtyyfthgfdooc.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_publishable_tErxtF60j9b47as05eLVqg_0gdrR9b3")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "sb_publishable_tErxtF60j9b47as05eLVqg_0gdrR9b3")

# Para operaciones que requieren permisos elevados (como migración de datos)
# usa SUPABASE_SERVICE_ROLE_KEY en lugar de SUPABASE_KEY
