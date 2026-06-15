import pandas as pd
import io

def exportar_locales_to_excel(db):
    # Obtener todos los locales
    response = db.table('locales').select('*').execute()
    locales = response.data
    
    if not locales:
        raise ValueError("No hay locales para exportar")
    
    # Crear DataFrame
    df = pd.DataFrame(locales)
    
    # Reordenar columnas para mejor presentación
    columnas = ['nombre_local']
    df = df[columnas]
    
    # Renombrar columnas para mejor legibilidad
    df.columns = ['Nombre Local']
    
    # Guardar en bytes usando BytesIO
    output = io.BytesIO()
    df.to_excel(output, index=False, engine='openpyxl')
    output.seek(0)
    excel_bytes = output.getvalue()
    
    return excel_bytes



def importar_locales_from_excel(db, excel_bytes):
    # Leer el archivo Excel
    df = pd.read_excel(io.BytesIO(excel_bytes))
    
    # Insertar los locales en la base de datos con manejo de errores
    import time
    for index, row in df.iterrows():
        try:
            db.table('locales').insert({
                'nombre_local': row['Nombre Local']
            }).execute()
            time.sleep(0.1)  # Pequeña pausa para evitar sobrecarga
        except Exception as e:
            print(f"Error al insertar el local {row['Nombre Local']}: {str(e)}")
            continue