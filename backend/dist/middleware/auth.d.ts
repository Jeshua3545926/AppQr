import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        role: string;
        user_id: string;
        username: string;
    };
}
export declare function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void;
export declare function requireRole(allowedRoles: string[]): (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare function generateToken(role: string, user_id: string, username: string): string;
export declare function verifyToken(token: string): any;
//# sourceMappingURL=auth.d.ts.map