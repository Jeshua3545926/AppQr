import pandas as pd
import io


def export_empleados_to_excel(db):
    # Obtener todos los empleados
    response = db.table('empleado').select('*').execute()
    empleados = response.data
    
    if not empleados:
        raise ValueError("No hay empleados para exportar")
    
    # Crear DataFrame
    df = pd.DataFrame(empleados)
    
    # Reordenar columnas para mejor presentación
    columnas = ['nombre']
    df = df[columnas]
    
    # Renombrar columnas para mejor legibilidad
    df.columns = ['Nombre']
    
    # Guardar en bytes usando BytesIO
    output = io.BytesIO()
    df.to_excel(output, index=False, engine='openpyxl')
    output.seek(0)
    excel_bytes = output.getvalue()
    
    return excel_bytes
def importar_empleados_from_excel(db, excel_bytes):
    # Leer el archivo Excel
    df = pd.read_excel(io.BytesIO(excel_bytes))
    
    # Insertar los empleados en la base de datos con manejo de errores
    import time
    for index, row in df.iterrows():
        try:
            db.table('empleado').insert({
                'nombre': row['Nombre']
            }).execute()
            # Pequeño delay para no saturar la conexión
            time.sleep(0.1)
        except Exception as e:
            print(f"Error al insertar empleado {row['Nombre']}: {e}")
            # Reintentar una vez
            try:
                time.sleep(1)
                db.table('empleado').insert({
                    'nombre': row['Nombre']
                }).execute()
            except Exception as e2:
                print(f"Error al reintentar insertar empleado {row['Nombre']}: {e2}")
    
    return True