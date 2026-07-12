export interface QrTokenPayload {
    type: 'local_attendance';
    local_name: string;
    nombre_empleado?: string;
    fecha?: string;
    hora?: string;
    created_at?: string;
}
export declare function generateQrToken(nombre_local: string, nombre_empleado: string, fecha: string, hora: string): string;
export declare function decodeQrPayload(token: string): QrTokenPayload | null;
export declare function resolveLocalIdFromQrToken(token: string): Promise<string | null>;
export declare function generateQrImage(qr_url: string): Promise<string>;
export declare function saveExcel(): Promise<Buffer>;
//# sourceMappingURL=qrService.d.ts.map