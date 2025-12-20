import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getSqlPool } from "../shared/sqlPool";
import { requireAllowedUser, AuthError } from "../shared/auth";

/**
 * GET /api/db-time
 * Returns current Azure SQL DB UTC time
 */

export async function dbTime(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        // Extract and validate authenticated user from SWA headers
        const user = requireAllowedUser(request);

        // Get pooled SQL connection
        const pool = await getSqlPool(context);

        // Query current UTC time from DB
        const result = await pool.request().query("SELECT SYSUTCDATETIME() AS current_utc_time");

        // Return JSON response
        return {
            status: 200,
            jsonBody: {
                user: user.username,
                databaseTimeUtc: result.recordset[0].current_utc_time
            }
        };
    } catch (err: any) {
        if (err instanceof AuthError) {
            // Return 401/403 for auth errors
            return { status: err.status, jsonBody: { error: err.message } };
        }

        // Log unexpected errors and return 500
        context.error("Unhandled error in db-time", err);
        return { status: 500, jsonBody: { error: "Internal server error" } };
    }
};

app.http('dbTime', {
    route: "db-time",
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: dbTime
});
