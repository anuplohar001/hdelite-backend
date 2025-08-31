import "express-serve-static-core";

declare module "express-serve-static-core" {
    interface Request {
        jwt?: {
            id: string;
            email: string;
            displayName?: string;
        };
    }
}
