import type { Request } from 'express';

export type JwtPayload = { sub: string; email: string };
export type AuthPayload = { id: string; email?: string };
export type TokenType = { token: string };
export type RequestWithUser = Request & { user: AuthPayload };
