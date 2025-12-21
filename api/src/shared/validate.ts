import { ALLOWED_SORT_COLUMNS } from "./sqlHelpers";

export function validateCreateRecipe(body: any): any | null {
    if (!body) return { error: "Missing body" };
    if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) return { error: "title is required" };
    if (body.title.length > 200) return { error: "title too long" };
    if (!body.ingredients || typeof body.ingredients !== "string") return { error: "ingredients required" };
    if (!body.steps || typeof body.steps !== "string") return { error: "steps required" };
    if (body.cuisine && body.cuisine.length > 100) return { error: "cuisine too long" };
    return null;
}

export function validateUpdateRecipe(body: any): any | null {
    if (!body) return { error: "Missing body" };
    if (body.title && (typeof body.title !== "string" || body.title.length === 0)) return { error: "title must be non-empty string" };
    if (body.title && body.title.length > 200) return { error: "title too long" };
    if (body.cuisine && body.cuisine.length > 100) return { error: "cuisine too long" };
    return null;
}

export function validateListQuery(q: any): any | null {
    if (!q) return { error: "Invalid query" };
    const page = parseInt(q.page as any, 10) || 1;
    const pageSize = parseInt(q.pageSize as any, 10) || 20;
    if (page < 1) return { error: "page must be >= 1" };
    if (pageSize < 1 || pageSize > 10000) return { error: "pageSize must be 1..10000" };
    if (q.sortBy && !ALLOWED_SORT_COLUMNS.has((q.sortBy as string).toLowerCase())) return { error: "invalid sortBy" };
    if (q.sortDir && !["asc","desc"].includes((q.sortDir as string).toLowerCase())) return { error: "invalid sortDir" };
    return null;
}
