import hashlib
import pytz
from datetime import datetime
from config import BASE_DIR

# Zona horaria de México (UTC-6)
mexico_tz = pytz.timezone('America/Mexico_City')

def get_mexico_time():
    """Obtener la fecha y hora actual en zona horario de México"""
    return datetime.now(mexico_tz).strftime("%Y-%m-%d %H:%M:%S")

def get_mexico_datetime():
    """Obtener el datetime actual en zona horario de México"""
    return datetime.now(mexico_tz)

def hash_password(password):
    """Hashear contraseña usando SHA256"""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()
