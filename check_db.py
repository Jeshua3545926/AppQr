import sqlite3

conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# Listar todas las tablas
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("Tablas en la base de datos:")
for table in tables:
    print(f"  - {table[0]}")

# Verificar esquema de registros
cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='registros'")
registros_schema = cursor.fetchone()
print("\nEsquema de registros:")
if registros_schema:
    print(registros_schema[0])
else:
    print("  Tabla registros no encontrada")

# Verificar esquema de qrs_generados
cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='qrs_generados'")
qrs_schema = cursor.fetchone()
print("\nEsquema de qrs_generados:")
if qrs_schema:
    print(qrs_schema[0])
else:
    print("  Tabla qrs_generados no encontrada")

conn.close()
