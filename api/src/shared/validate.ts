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

export function validateRecipeSearch(body: any): any | null {
    if (!body) return { error: "Missing body" };
    if (!body.query || typeof body.query !== "string" || body.query.trim().length === 0) return { error: "query is required" };
    if (body.mode && !["vector", "keyword", "hybrid"].includes(body.mode)) return { error: "invalid mode" };
    if (body.topK && (typeof body.topK !== "number" || body.topK < 1)) return { error: "topK must be a positive number" };
    return null;
}