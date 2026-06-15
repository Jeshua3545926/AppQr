import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pandas as pd
import qrcode
import io
import hashlib
from config import QR_DIR, PDF_DIR, BASE_URL
from utils.helpers import get_mexico_datetime

def save_excel():
    """Guarda el registro en formato excel"""
    from models.database import get_db
    db = get_db()
    
    # Obtener registros con joins
    response = db.table('registros_asistencia').select('*').order('fecha_hora', desc=True).execute()
    registros_raw = response.data
    
    # Obtener datos relacionados manualmente
    registros = []
    for reg in registros_raw:
        emp_response = db.table('empleado').select('nombre').eq('id', reg['empleado_id']).execute()
        local_response = db.table('locales').select('nombre_local').eq('id', reg['locales_id']).execute()
        
        empleado_nombre = emp_response.data[0]['nombre'] if emp_response.data else 'Desconocido'
        local_nombre = local_response.data[0]['nombre_local'] if local_response.data else 'Desconocido'
        
        registros.append({
            'ID': reg['id'],
            'Empleado': empleado_nombre,
            'Local': local_nombre,
            'Fecha': reg['fecha_hora']
        })

    # Crear DataFrame
    df = pd.DataFrame(registros)
    
    # Crear archivo Excel en memoria
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Registros')
    output.seek(0)
    
    return output

def generar_pdf_qrs():
    """Generar PDF con códigos QR de locales"""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak
        from reportlab.lib.styles import getSampleStyleSheet
    except Exception as e:
        print("No se pudo generar PDF. Instala reportlab:", e)
        return None

    from models.database import get_db
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    pdf_path = PDF_DIR / "qrs_locales.pdf"

    db = get_db()
    response = db.table('locales').select('id, nombre_local').order('id').execute()
    locales = response.data

    doc = SimpleDocTemplate(str(pdf_path), pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("Códigos QR de Locales", styles["Title"]))
    story.append(Paragraph("Imprime estas hojas y pega cada QR en su local correspondiente.", styles["Normal"]))
    story.append(Spacer(1, 20))

    for i, local in enumerate(locales):
        qr_path = QR_DIR / f"local_{local['id']}.png"
        story.append(Paragraph(f"Local: {local['nombre_local']}", styles["Heading1"]))
        story.append(Spacer(1, 12))

        if qr_path.exists():
            story.append(Image(str(qr_path), width=260, height=260))

        if i < len(locales) - 1:
            story.append(PageBreak())

    doc.build(story)
    return pdf_path

def generate_qr_token(nombre_local, nombre_empleado, fecha, hora):
    """Generar token único para QR personalizado"""
    return hashlib.sha256(f"{nombre_local}{nombre_empleado}{fecha}{hora}{get_mexico_datetime().timestamp()}".encode()).hexdigest()[:12].upper()

def generate_qr_image(qr_url):
    """Generar imagen QR en base64"""
    import base64
    img = qrcode.make(qr_url)
    img_io = io.BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    return base64.b64encode(img_io.getvalue()).decode()
