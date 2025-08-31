// src/config/env.ts
function getEnvVar(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
}

export const ENV = {
    JWT_SECRET: getEnvVar("JWT_SECRET"),
    MONGO_URI: getEnvVar("MONGODB_URI"),
    PORT: getEnvVar("PORT"),
};
