import { Request } from 'express';

export interface ModifiedRequest extends Request {
    userId?: string;
}

export interface DecodedToken {
    email: string;
    customerId: string;
    iat: number;
    exp: number;
}