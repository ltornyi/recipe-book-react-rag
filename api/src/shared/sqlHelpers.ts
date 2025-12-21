import sql from "mssql";

// Include aliases returned by queries (e.g. created_by_user_email) so the API can sort by joined fields
export const ALLOWED_SORT_COLUMNS = new Set(["recipe_id", "title", "cuisine", "created_at", "updated_at", "is_public", "created_by_user_email"]);

export function sanitizeSortColumn(col?: string): string {
    if (!col) return "created_at";
    const lower = col.toLowerCase();
    if (ALLOWED_SORT_COLUMNS.has(lower)) return lower;
    throw new Error(`Invalid sort column: ${col}`);
}

export function sanitizeSortDir(dir?: string): string {
    if (!dir) return "ASC";
    const d = dir.toLowerCase();
    if (d === "asc") return "ASC";
    if (d === "desc") return "DESC";
    throw new Error(`Invalid sort direction: ${dir}`);
}

/**
 * Build WHERE clauses from simple filters. Returns an array of clauses and a map of parameter values.
 * Filters are expected as equality filters for now.
 */
export function buildFilterClauses(filters: Record<string, any>, request: sql.ConnectionPool): { clauses: string[]; params: { name: string; value: any; type?: any }[] } {
    const clauses: string[] = [];
    const params: { name: string; value: any; type?: any }[] = [];

    if (!filters) return { clauses, params };

    let idx = 0;
    for (const key of Object.keys(filters)) {
        const col = key.toLowerCase();
        // only allow a small set of filterable columns
        if (["recipe_id", "cuisine", "created_by_user_id", "is_public" , "title"].indexOf(col) === -1) continue;
        idx += 1;
        const paramName = `f_${idx}`;
        clauses.push(`r.[${col}] = @${paramName}`);
        params.push({ name: paramName, value: filters[key] });
    }

    return { clauses, params };
}
