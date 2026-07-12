import { supabase } from '../config/database';
import * as XLSX from 'xlsx';

export async function exportEmpleadosToExcel(): Promise<Buffer> {
  try {
    const { data: empleados, error } = await supabase
      .from('empleado')
      .select('*')
      .order('nombre');

    if (error) throw error;

    const worksheet = XLSX.utils.json_to_sheet(empleados || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Empleados');

    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return excelBuffer as Buffer;
  } catch (error) {
    console.error('Error exporting empleados:', error);
    throw new Error('Error al exportar empleados');
  }
}

export async function importEmpleadosFromExcel(buffer: Buffer): Promise<void> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    for (const row of data as any[]) {
      if (row.nombre) {
        await supabase
          .from('empleado')
          .insert({ nombre: row.nombre });
      }
    }
  } catch (error) {
    console.error('Error importing empleados:', error);
    throw new Error('Error al importar empleados');
  }
}

export async function exportLocalesToExcel(): Promise<Buffer> {
  try {
    const { data: locales, error } = await supabase
      .from('locales')
      .select('*')
      .order('nombre_local');

    if (error) throw error;

    const worksheet = XLSX.utils.json_to_sheet(locales || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Locales');

    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return excelBuffer as Buffer;
  } catch (error) {
    console.error('Error exporting locales:', error);
    throw new Error('Error al exportar locales');
  }
}

export async function importLocalesFromExcel(buffer: Buffer): Promise<void> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    for (const row of data as any[]) {
      if (row.nombre_local) {
        await supabase
          .from('locales')
          .insert({ nombre_local: row.nombre_local });
      }
    }
  } catch (error) {
    console.error('Error importing locales:', error);
    throw new Error('Error al importar locales');
  }
}
