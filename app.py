from flask import Flask, render_template, request, redirect, jsonify, send_file, session, url_for
import sqlite3
from datetime import datetime
from pathlib import Path
import smtplib
from email.message import EmailMessage
import os
import qrcode
import hashlib
from functools import wraps

app = Flask(__name__)

app.secret_key = os.getenv("SECRET_KEY", "cambia_esta_clave_secreta")
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "database.db"
QR_DIR = BASE_DIR / "static" / "qrcodes"
PDF_DIR = BASE_DIR / "static" / "pdfs"

SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
SMTP_APP_PASSWORD = os.getenv("SMTP_APP_PASSWORD", "")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = os.getenv("SMTP_PORT", "465")
SMTP_SECURITY = os.getenv("SMTP_SECURITY", "ssl")
BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:5000")

def hash_password(password):
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def ensure_admin_schema():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("PRAGMA table_info(admins)")
    columns = [row[1] for row in cur.fetchall()]
    schema_updates = [
        ("email", "ALTER TABLE admins ADD COLUMN email TEXT"),
        ("smtp_host", "ALTER TABLE admins ADD COLUMN smtp_host TEXT"),
        ("smtp_port", "ALTER TABLE admins ADD COLUMN smtp_port INTEGER"),
        ("smtp_security", "ALTER TABLE admins ADD COLUMN smtp_security TEXT"),
        ("smtp_email", "ALTER TABLE admins ADD COLUMN smtp_email TEXT"),
        ("smtp_password", "ALTER TABLE admins ADD COLUMN smtp_password TEXT"),
    ]
    for column_name, sql in schema_updates:
        if column_name not in columns:
            cur.execute(sql)
            conn.commit()
    conn.close()


# Some Flask versions may not expose `before_first_request` as an attribute in this environment.
# Call schema migration at startup instead of using the decorator.

def role_required(role):
    def decorator(view):
        @wraps(view)
        def wrapped_view(*args, **kwargs):
            if session.get("role") != role:
                if role == "admin":
                    return redirect(url_for("login"))
                return redirect(url_for("user_login"))
            return view(*args, **kwargs)
        return wrapped_view
    return decorator

login_required = role_required("admin")

def get_smtp_settings():
    settings = {
        "admin_email": (ADMIN_EMAIL or "").strip(),
        "smtp_host": (SMTP_HOST or "").strip() or "smtp.gmail.com",
        "smtp_port": SMTP_PORT,
        "smtp_security": (SMTP_SECURITY or "ssl").strip().lower(),
        "smtp_email": (SMTP_EMAIL or "").strip(),
        "smtp_password": SMTP_APP_PASSWORD or "",
    }

    try:
        conn = get_db()
        row = conn.execute(
            """
            SELECT email, smtp_host, smtp_port, smtp_security, smtp_email, smtp_password
            FROM admins
            ORDER BY id ASC
            LIMIT 1
            """
        ).fetchone()
        conn.close()

        if row:
            if row["email"]:
                settings["admin_email"] = row["email"].strip()
            if row["smtp_host"]:
                settings["smtp_host"] = row["smtp_host"].strip()
            if row["smtp_port"]:
                settings["smtp_port"] = row["smtp_port"]
            if row["smtp_security"]:
                settings["smtp_security"] = row["smtp_security"].strip().lower()
            if row["smtp_email"]:
                settings["smtp_email"] = row["smtp_email"].strip()
            if row["smtp_password"]:
                settings["smtp_password"] = row["smtp_password"]
    except Exception:
        pass

    try:
        settings["smtp_port"] = int(settings["smtp_port"])
    except (TypeError, ValueError):
        settings["smtp_port"] = 465

    if settings["smtp_security"] not in {"ssl", "starttls"}:
        settings["smtp_security"] = "ssl"

    return settings


def enviar_correo(asunto, cuerpo):
    settings = get_smtp_settings()
    admin_email = settings["admin_email"]
    smtp_email = settings["smtp_email"]
    smtp_password = settings["smtp_password"]
    smtp_host = settings["smtp_host"]
    smtp_port = settings["smtp_port"]
    smtp_security = settings["smtp_security"]

    if not smtp_email or not smtp_password or not admin_email:
        error_message = "Falta configurar correo emisor, clave SMTP o correo destino del admin"
        print(f"Correo no configurado: {error_message}. Registro guardado sin enviar email.")
        return {
            "ok": False,
            "status": "not_configured",
            "message": error_message,
        }

    msg = EmailMessage()
    msg["Subject"] = asunto
    msg["From"] = smtp_email
    msg["To"] = admin_email
    msg.set_content(cuerpo)

    try:
        if smtp_security == "starttls":
            with smtplib.SMTP(smtp_host, smtp_port) as smtp:
                smtp.ehlo()
                smtp.starttls()
                smtp.ehlo()
                smtp.login(smtp_email, smtp_password)
                smtp.send_message(msg)
        else:
            with smtplib.SMTP_SSL(smtp_host, smtp_port) as smtp:
                smtp.login(smtp_email, smtp_password)
                smtp.send_message(msg)
        return {
            "ok": True,
            "status": "sent",
            "message": "Correo enviado",
        }
    except Exception as e:
        print(f"Error enviando correo: {e}")
        return {
            "ok": False,
            "status": "error",
            "message": str(e),
        }

def generar_qr_files():
    QR_DIR.mkdir(parents=True, exist_ok=True)
    conn = get_db()
    locales = conn.execute("SELECT id, nombre, qr_token FROM locales").fetchall()
    conn.close()

    for local in locales:
        qr_url = f"{BASE_URL}/scan/{local['qr_token']}"
        img = qrcode.make(qr_url)
        img.save(QR_DIR / f"local_{local['id']}.png")

def generar_pdf_qrs():
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak
        from reportlab.lib.styles import getSampleStyleSheet
    except Exception as e:
        print("No se pudo generar PDF. Instala reportlab:", e)
        return None

    PDF_DIR.mkdir(parents=True, exist_ok=True)
    pdf_path = PDF_DIR / "qrs_locales.pdf"

    conn = get_db()
    locales = conn.execute("SELECT id, nombre, qr_token FROM locales ORDER BY id ASC").fetchall()
    conn.close()

    doc = SimpleDocTemplate(str(pdf_path), pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("Códigos QR de Locales", styles["Title"]))
    story.append(Paragraph("Imprime estas hojas y pega cada QR en su local correspondiente.", styles["Normal"]))
    story.append(Spacer(1, 20))

    for i, local in enumerate(locales):
        qr_path = QR_DIR / f"local_{local['id']}.png"
        story.append(Paragraph(f"Local: {local['nombre']}", styles["Heading1"]))
        story.append(Paragraph(f"Token: {local['qr_token']}", styles["Normal"]))
        story.append(Spacer(1, 12))

        if qr_path.exists():
            story.append(Image(str(qr_path), width=260, height=260))

        if i < len(locales) - 1:
            story.append(PageBreak())

    doc.build(story)
    return pdf_path

@app.route("/")
def home():
    if session.get("role") == "admin":
        return redirect("/admin")
    if session.get("role") == "user":
        return redirect("/scanner")
    return redirect("/login")

@app.route("/login", methods=["GET", "POST"])
def login():
    error = None
    conn = get_db()
    empleados = conn.execute("SELECT * FROM empleados ORDER BY nombre ASC").fetchall()
    conn.close()

    if request.method == "POST":
        login_type = request.form.get("login_type")

        if login_type == "admin":
            username = request.form.get("username", "").strip()
            password = request.form.get("password", "")
            conn = get_db()
            admin = conn.execute(
                "SELECT * FROM admins WHERE username = ? AND password_hash = ?",
                (username, hash_password(password))
            ).fetchone()
            conn.close()

            if admin:
                session.clear()
                session["role"] = "admin"
                session["admin_id"] = admin["id"]
                session["admin_username"] = admin["username"]
                return redirect("/admin")

            error = "Usuario o contraseña incorrectos"

        elif login_type == "user":
            empleado_id = request.form.get("empleado_id")
            if not empleado_id:
                error = "Debes seleccionar un empleado para iniciar sesión"
            else:
                conn = get_db()
                empleado = conn.execute("SELECT * FROM empleados WHERE id = ?", (empleado_id,)).fetchone()
                conn.close()
                if not empleado:
                    error = "Empleado no válido"
                else:
                    session.clear()
                    session["role"] = "user"
                    session["user_id"] = empleado["id"]
                    session["user_name"] = empleado["nombre"]
                    return redirect("/scanner")

        else:
            error = "Selecciona un tipo de inicio de sesión válido"

    return render_template("login.html", error=error, empleados=empleados)

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

@app.route("/admin", methods=["GET", "POST"])
@login_required
def admin():
    error = None
    success = None
    conn = get_db()

    if request.method == "POST":
        action = request.form.get("action")

        if action == "create_employee":
            nombre_empleado = request.form.get("nombre_empleado", "").strip()
            if not nombre_empleado:
                error = "Debes ingresar el nombre del empleado"
            else:
                conn.execute("INSERT INTO empleados (nombre) VALUES (?)", (nombre_empleado,))
                conn.commit()
                success = "Empleado creado correctamente"

    registros = conn.execute('''
        SELECT registros.id, empleados.nombre AS empleado, locales.nombre AS local, registros.fecha
        FROM registros
        JOIN empleados ON registros.empleado_id = empleados.id
        JOIN locales ON registros.local_id = locales.id
        ORDER BY registros.fecha DESC
        LIMIT 50
    ''').fetchall()

    locales = conn.execute("SELECT * FROM locales ORDER BY id ASC").fetchall()
    conn.close()

    return render_template(
        "admin.html",
        registros=registros,
        locales=locales,
        error=error,
        success=success
    )

@app.route("/admin/settings", methods=["GET", "POST"])
@login_required
def admin_settings():
    error = None
    success = None
    conn = get_db()
    admin_row = conn.execute("SELECT * FROM admins WHERE id = ?", (session["admin_id"],)).fetchone()

    if request.method == "POST":
        action = request.form.get("action", "save")
        new_username = request.form.get("new_admin_username", "").strip()
        new_email = request.form.get("admin_email", "").strip()
        smtp_host = request.form.get("smtp_host", "").strip()
        smtp_port_raw = request.form.get("smtp_port", "").strip()
        smtp_security = request.form.get("smtp_security", "ssl").strip().lower()
        smtp_email = request.form.get("smtp_email", "").strip()
        smtp_password = request.form.get("smtp_password", "")
        current_password = request.form.get("current_password", "")
        new_password = request.form.get("new_password", "")
        confirm_password = request.form.get("confirm_password", "")

        if admin_row is None:
            error = "No se encontró el usuario administrador"
        else:
            smtp_port = None
            if smtp_port_raw:
                try:
                    smtp_port = int(smtp_port_raw)
                    if smtp_port <= 0:
                        raise ValueError()
                except ValueError:
                    error = "El puerto SMTP debe ser un número válido"

            if not error and smtp_security not in {"ssl", "starttls"}:
                error = "Selecciona un tipo de seguridad SMTP válido"

            if new_username and new_username != admin_row["username"]:
                existing = conn.execute("SELECT id FROM admins WHERE username = ?", (new_username,)).fetchone()
                if existing:
                    error = "El nombre de usuario ya está en uso"
                else:
                    conn.execute("UPDATE admins SET username = ? WHERE id = ?", (new_username, session["admin_id"]))
                    session["admin_username"] = new_username
                    success = "Usuario administrador actualizado"
            if not error and new_password:
                if not current_password:
                    error = "Ingresa tu contraseña actual para cambiar la contraseña"
                elif hash_password(current_password) != admin_row["password_hash"]:
                    error = "Contraseña actual incorrecta"
                elif new_password != confirm_password:
                    error = "La nueva contraseña y su confirmación no coinciden"
                else:
                    conn.execute("UPDATE admins SET password_hash = ? WHERE id = ?", (hash_password(new_password), session["admin_id"]))
                    success = "Contraseña actualizada correctamente"
            current_email = admin_row["email"] if "email" in admin_row.keys() else ""
            if not error and new_email != current_email:
                conn.execute("UPDATE admins SET email = ? WHERE id = ?", (new_email, session["admin_id"]))
                success = "Datos de administrador actualizados"
            current_smtp_host = admin_row["smtp_host"] if "smtp_host" in admin_row.keys() and admin_row["smtp_host"] else ""
            current_smtp_port = admin_row["smtp_port"] if "smtp_port" in admin_row.keys() and admin_row["smtp_port"] else None
            current_smtp_security = admin_row["smtp_security"] if "smtp_security" in admin_row.keys() and admin_row["smtp_security"] else "ssl"
            current_smtp_email = admin_row["smtp_email"] if "smtp_email" in admin_row.keys() and admin_row["smtp_email"] else ""
            current_smtp_password = admin_row["smtp_password"] if "smtp_password" in admin_row.keys() and admin_row["smtp_password"] else ""

            smtp_changed = (
                smtp_host != current_smtp_host
                or smtp_port != current_smtp_port
                or smtp_security != current_smtp_security
                or smtp_email != current_smtp_email
                or bool(smtp_password)
            )
            if not error and smtp_changed:
                conn.execute(
                    """
                    UPDATE admins
                    SET smtp_host = ?, smtp_port = ?, smtp_security = ?, smtp_email = ?, smtp_password = ?
                    WHERE id = ?
                    """,
                    (
                        smtp_host,
                        smtp_port,
                        smtp_security,
                        smtp_email,
                        smtp_password if smtp_password else current_smtp_password,
                        session["admin_id"],
                    )
                )
                success = "Configuración de correo actualizada"

            if not error:
                conn.commit()
                admin_row = conn.execute("SELECT * FROM admins WHERE id = ?", (session["admin_id"],)).fetchone()
                if action == "test_smtp":
                    test_subject = "Prueba de configuracion SMTP"
                    test_body = (
                        f"Hola {session.get('admin_username', 'admin')},\n\n"
                        "Este es un correo de prueba enviado desde la configuracion de la app.\n"
                        "Si recibiste este mensaje, la configuracion SMTP esta funcionando.\n"
                    )
                    correo_resultado = enviar_correo(test_subject, test_body)
                    if correo_resultado["ok"]:
                        success = "Correo de prueba enviado correctamente"
                    else:
                        error = f"No se pudo enviar el correo de prueba: {correo_resultado['message']}"

    admin_email = admin_row["email"] if admin_row and "email" in admin_row.keys() else ""
    admin_username = admin_row["username"] if admin_row else ""
    smtp_host_value = admin_row["smtp_host"] if admin_row and "smtp_host" in admin_row.keys() and admin_row["smtp_host"] else SMTP_HOST
    smtp_port_value = admin_row["smtp_port"] if admin_row and "smtp_port" in admin_row.keys() and admin_row["smtp_port"] else SMTP_PORT
    smtp_security_value = admin_row["smtp_security"] if admin_row and "smtp_security" in admin_row.keys() and admin_row["smtp_security"] else SMTP_SECURITY
    smtp_email_value = admin_row["smtp_email"] if admin_row and "smtp_email" in admin_row.keys() and admin_row["smtp_email"] else SMTP_EMAIL
    conn.close()

    return render_template(
        "admin_settings.html",
        admin_email=admin_email,
        admin_username=admin_username,
        smtp_host=smtp_host_value,
        smtp_port=smtp_port_value,
        smtp_security=smtp_security_value,
        smtp_email=smtp_email_value,
        error=error,
        success=success
    )

@app.route("/descargar-qrs")
@login_required
def descargar_qrs():
    generar_qr_files()
    pdf_path = generar_pdf_qrs()

    if not pdf_path or not pdf_path.exists():
        return "No se pudo generar PDF. Revisa que reportlab esté instalado.", 500

    return send_file(pdf_path, as_attachment=True)

@app.route("/scanner")
def scanner():
    conn = get_db()
    empleados = conn.execute("SELECT * FROM empleados ORDER BY nombre ASC").fetchall()
    conn.close()
    return render_template(
        "scanner.html",
        empleados=empleados,
        selected_user_id=session.get("user_id"),
        selected_user_name=session.get("user_name"),
        role=session.get("role")
    )

@app.route("/scan/<token>")
def scan_token(token):
    conn = get_db()
    local = conn.execute("SELECT * FROM locales WHERE qr_token = ?", (token,)).fetchone()
    empleados = conn.execute("SELECT * FROM empleados ORDER BY nombre ASC").fetchall()
    conn.close()

    if not local:
        return "QR inválido", 404

    return render_template(
        "confirmar.html",
        local=local,
        empleados=empleados,
        selected_user_id=session.get("user_id"),
        selected_user_name=session.get("user_name"),
        role=session.get("role")
    )

@app.route("/api/registrar", methods=["POST"])
def api_registrar():
    data = request.get_json()
    empleado_id = data.get("empleado_id")
    qr_token = data.get("qr_token")

    if not empleado_id and session.get("role") == "user":
        empleado_id = session.get("user_id")

    if not empleado_id or not qr_token:
        return jsonify({"ok": False, "error": "Falta empleado o QR"}), 400

    conn = get_db()
    local = conn.execute("SELECT * FROM locales WHERE qr_token = ?", (qr_token,)).fetchone()

    if not local:
        conn.close()
        return jsonify({"ok": False, "error": "QR inválido"}), 404

    empleado = conn.execute("SELECT * FROM empleados WHERE id = ?", (empleado_id,)).fetchone()

    if not empleado:
        conn.close()
        return jsonify({"ok": False, "error": "Empleado inválido"}), 404

    fecha = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    conn.execute(
        "INSERT INTO registros (empleado_id, local_id, fecha) VALUES (?, ?, ?)",
        (empleado_id, local["id"], fecha)
    )
    conn.commit()
    conn.close()

    asunto = "Nuevo registro de asistencia/recolección"
    cuerpo = f"{empleado['nombre']} registró llegada/recolección en {local['nombre']} el {fecha}."
    correo_resultado = enviar_correo(asunto, cuerpo)

    return jsonify({
        "ok": True,
        "mensaje": f"{empleado['nombre']} registró llegada/recolección en {local['nombre']}",
        "empleado": empleado["nombre"],
        "local": local["nombre"],
        "fecha": fecha,
        "correo_enviado": correo_resultado["ok"],
        "correo_estado": correo_resultado["status"],
        "correo_mensaje": correo_resultado["message"],
    })

@app.route("/api/registros")
@login_required
def api_registros():
    conn = get_db()
    registros = conn.execute('''
        SELECT registros.id, empleados.nombre AS empleado, locales.nombre AS local, registros.fecha
        FROM registros
        JOIN empleados ON registros.empleado_id = empleados.id
        JOIN locales ON registros.local_id = locales.id
        ORDER BY registros.fecha DESC
        LIMIT 20
    ''').fetchall()
    conn.close()

    return jsonify([dict(r) for r in registros])

if __name__ == "__main__":
    # Ensure DB schema is up-to-date (add admin.email if missing)
    try:
        ensure_admin_schema()
    except Exception:
        pass

    generar_qr_files()
    generar_pdf_qrs()
    app.run(host = "0.0.0.0", port =5000, debug=True)
