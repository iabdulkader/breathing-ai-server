import { Request } from 'express';

export interface ModifiedRequest extends Request {
    userId?: string;
    customerId?: string;
}

export interface DecodedToken {
    email: string;
    customerId: string;
    userId: string;
    iat: number;
    exp: number;

}