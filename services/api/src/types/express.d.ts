import { Request } from 'express';

declare module 'express' {
  interface Request {
    rawBody?: Buffer | string;
    user?: {
      id: string;
      email?: string;
      role?: string;
      [key: string]: any;
    };
  }
}
