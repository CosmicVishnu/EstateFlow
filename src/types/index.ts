import { Request } from 'express';

export interface JwtUserPayload {
  userId: string;
  email: string;
  role: 'admin' | 'agent' | 'user';
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}
