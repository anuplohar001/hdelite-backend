import { Request } from "express";

export interface JwtPayload {
    id: string;
    email: string;
    displayName?: string;
}

export type AuthenticatedRequest = Request & { jwt?: JwtPayload };
