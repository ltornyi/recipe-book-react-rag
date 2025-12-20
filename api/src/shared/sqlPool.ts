import sql from "mssql";
import { InvocationContext } from "@azure/functions";

let pool: sql.ConnectionPool | null = null;

/**
 * Singleton pooled SQL connection
 */
export async function getSqlPool(context: InvocationContext): Promise<sql.ConnectionPool> {
    if (pool && pool.connected) return pool;

    context.log("SQL server:", process.env.AZURE_SQL_SERVER);
    context.log("SQL database:", process.env.AZURE_SQL_DATABASE);

    pool = new sql.ConnectionPool({
        server: process.env.AZURE_SQL_SERVER!,
        database: process.env.AZURE_SQL_DATABASE!,
        user: process.env.AZURE_SQL_USER!,
        password: process.env.AZURE_SQL_PASSWORD!,
        options: { encrypt: true, enableArithAbort: true, trustServerCertificate: false },
        pool: { max: 5, min: 0, idleTimeoutMillis: 30000 }
    });

    await pool.connect();
    pool.on("close", () => console.log("SQL connection pool closed"));

    context.log("Connected to SQL database");
    return pool;
}
