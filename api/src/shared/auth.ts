import { HttpRequest } from "@azure/functions";

export interface AuthenticatedUser {
    userId: string;
    username: string;
    identityProvider: string;
    userRoles: string[];
}

/**
 * Centralised auth + domain-based authorisation
 */
export function requireAllowedUser(req: HttpRequest): AuthenticatedUser {
    const header = req.headers.get("x-ms-client-principal");
    if (!header) throw new AuthError(401, "Not authenticated");

    const principal = JSON.parse(Buffer.from(header, "base64").toString("utf-8"));
    const username: string | undefined = principal.userDetails;

    if (!username) throw new AuthError(401, "Invalid identity");

    // Only allow users with configured domain
    const domain = process.env.ALLOWED_EMAIL_DOMAIN;
    if (!username.endsWith(domain)) throw new AuthError(403, "Forbidden");

    return {
        userId: principal.userId,
        username,
        identityProvider: principal.identityProvider,
        userRoles: principal.userRoles || []
    };
}

/**
 * Custom auth error carrying HTTP status code
 */
export class AuthError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}
