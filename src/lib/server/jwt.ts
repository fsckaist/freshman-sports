import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';

export interface JWTPayload {
    uid: string;        // SSO uid
    sid: string;        // SSO session id
    studentNumber: string;
    dbUserId: string;   // Our DB user.id (UUID)
}

const TOKEN_EXPIRY = '7d';

export function signToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        return decoded;
    } catch {
        return null;
    }
}
