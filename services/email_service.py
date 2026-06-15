# import sys
# from pathlib import Path
# sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# import requests
# from config import SMTP_EMAIL, SMTP_APP_PASSWORD, ADMIN_EMAIL, SMTP_HOST, SMTP_PORT, SMTP_SECURITY

# def get_smtp_settings():
#     """Obtener configuración SMTP de variables de entorno o base de datos"""
#     settings = {
#         "admin_email": (ADMIN_EMAIL or "").strip(),
#         "smtp_host": (SMTP_HOST or "").strip() or "smtp.gmail.com",
#         "smtp_port": SMTP_PORT,
#         "smtp_security": (SMTP_SECURITY or "ssl").strip().lower(),
#         "smtp_email": (SMTP_EMAIL or "").strip(),
#         "smtp_password": SMTP_APP_PASSWORD or "",
#     }

#     try:
#         from models.database import get_db
#         conn = get_db()
#         row = conn.execute(
#             """
#             SELECT email, smtp_host, smtp_port, smtp_security, smtp_email, smtp_password, admin_email_destino, sendgrid_api_key
#             FROM admins
#             ORDER BY id ASC
#             LIMIT 1
#             """
#         ).fetchone()
#         conn.close()

#         campos = [  
#             "email","smtp_host","smtp_port","smtp_security",
#             "smtp_email","smtp_password","admin_email_destino",
#             "sendgrid_api_key"
#         ]   
        
#         for campo in campos:
#             valor = row[campo]
#             if valor is not None and valor != "":
#                 valor = valor.strip()
#                 settings[campo] = valor
        
#         if settings.get("smtp_security"):
#             settings["smtp_security"] = settings["smtp_security"].lower()

#     except Exception:
#         pass

#     try:
#         settings["smtp_port"] = int(settings["smtp_port"])
#     except (TypeError, ValueError):
#         settings["smtp_port"] = 465

#     if settings["smtp_security"] not in {"ssl", "starttls"}:
#         settings["smtp_security"] = "ssl"

#     return settings

# def enviar_correo(asunto, cuerpo):
#     """Enviar correo usando Mailgun"""
#     settings = get_smtp_settings()
#     mailgun_api_key = settings.get("sendgrid_api_key", "")
#     admin_email = settings["admin_email"]

#     if not mailgun_api_key or not admin_email:
#         error_message = "Falta configurar API Key de Mailgun o correo destino del admin"
#         print(f"Correo no configurado: {error_message}. Registro guardado sin enviar email.")
#         return {
#             "ok": False,
#             "status": "not_configured",
#             "message": error_message,
#         }

#     try:
#         # Usar sandbox de Mailgun para pruebas
#         url = "https://api.mailgun.net/v3/sandboxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.mailgun.org/messages"
        
#         # Si tienes tu dominio de Mailgun, usa:
#         # url = "https://api.mailgun.net/v3/YOUR_DOMAIN/messages"
        
#         response = requests.post(
#             url,
#             auth=("api", mailgun_api_key),
#             data={
#                 "from": "noreply@appqr-g3ft.onrender.com",
#                 "to": admin_email,
#                 "subject": asunto,
#                 "text": cuerpo
#             },
#             timeout=30
#         )

#         print(f"Mailgun response status: {response.status_code}")
#         if response.status_code >= 200 and response.status_code < 300:
#             return {
#                 "ok": True,
#                 "status": "sent",
#                 "message": "Correo enviado",
#             }
#         else:
#             return {
#                 "ok": False,
#                 "status": "error",
#                 "message": f"Mailgun error: {response.status_code} - {response.text}",
#             }
#     except Exception as e:
#         print(f"Error enviando correo con Mailgun: {e}")
#         import traceback
#         traceback.print_exc()
#         return {
#             "ok": False,
#             "status": "error",
#             "message": str(e),
#         }
