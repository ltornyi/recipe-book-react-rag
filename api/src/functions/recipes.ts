import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getSqlPool } from "../shared/sqlPool";
import * as recipesRepo from "../shared/recipesRepo";
import { validateCreateRecipe, validateUpdateRecipe, validateListQuery } from "../shared/validate";
import { ok, created, noContent, badRequest, serverError } from "../shared/responseHelpers";
import { tryGetUser } from "../shared/auth";
import { generateEmbedding } from "../shared/openAI";
import { deleteRecipeFromSearchIndex, SearchRecipe, storeRecipeInSearchIndex } from "../shared/search";

/**
 * Recipes API handlers
 */

export async function listRecipes(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const { user, error } = tryGetUser(request);
        if (error) return error;

        const q = request.query.get("q") || undefined;
        const page = parseInt(request.query.get("page") || "1", 10);
        const pageSize = parseInt(request.query.get("pageSize") || "20", 10);
        const sortBy = request.query.get("sortBy") || undefined;
        const sortDir = request.query.get("sortDir") || "asc";

        // Collect simple filter= query params: filter_[column]=value
        const filters: Record<string, any> = {};
        for (const [k, v] of request.query.entries()) {
            if (k.startsWith("filter_")) {
                const col = k.substring(7);
                filters[col] = v;
            }
        }

        // Validate list query
        const listQuery = { page, pageSize, sortBy, sortDir, q, filters };
        const vErr = validateListQuery(listQuery);
        if (vErr) return badRequest(vErr);

        const pool = await getSqlPool(context);
        const result = await recipesRepo.getList(pool, { page, pageSize, sortBy, sortDir, search: q, filters }, user);

        return ok(result);
    } catch (err: any) {
        context.error("Unhandled error in listRecipes", err);
        return serverError();
    }
}

export async function getRecipe(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const { user, error } = tryGetUser(request);
        if (error) return error;

        const id = parseInt(request.params.id, 10);
        if (isNaN(id)) return badRequest({ error: "Invalid id" });

        const pool = await getSqlPool(context);
        const row = await recipesRepo.getById(pool, id, user);
        if (!row) return { status: 404, jsonBody: { error: "Not found" } };
        return ok(row);
    } catch (err: any) {
        context.error("Unhandled error in getRecipe", err);
        return serverError();
    }
}

async function buildSearchRecipe(recipeId: number, title: string, ingredients: string, steps: string): Promise<SearchRecipe> {
    const embedding = await generateEmbedding(`${title}\n\n${ingredients}\n\n${steps}`);
    return {
        id: recipeId.toString(),
        title,
        ingredients,
        steps,
        embedding
    };
}

export async function createRecipe(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const { user, error } = tryGetUser(request);
        if (error) return error;
        
        let body: any;
        try {
            body = await request.json();
        } catch (parseErr) {
            return badRequest({ error: "Invalid JSON body" });
        }
        
        const v = validateCreateRecipe(body);
        if (v) return badRequest(v);

        const pool = await getSqlPool(context);
        const newId = await recipesRepo.createRecipe(pool, body, user);

        try {
            const searchRecipe = await buildSearchRecipe(newId, body.title, body.ingredients, body.steps);
            await storeRecipeInSearchIndex(searchRecipe);
        } catch (searchErr) {
            context.error("Failed to store recipe in search index", searchErr);
            // const errorMessage =
            //     searchErr instanceof Error
            //         ? searchErr.stack ?? searchErr.message
            //         : String(searchErr);
            // return serverError(errorMessage + ', node version:' + process.version);
            return serverError("Failed to store recipe in search index: " + (searchErr as Error).message);
        }

        return created({ recipe_id: newId, message: "Created" });
    } catch (err: any) {
        context.error("Unhandled error in createRecipe", err);
        return serverError();
    }
}

export async function updateRecipe(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const { user, error } = tryGetUser(request);
        if (error) return error;
        const id = parseInt(request.params.id, 10);
        if (isNaN(id)) return badRequest({ error: "Invalid id" });

        let body: any;
        try {
            body = await request.json();
        } catch (parseErr) {
            return badRequest({ error: "Invalid JSON body" });
        }

        const v = validateUpdateRecipe(body);
        if (v) return badRequest(v);

        const pool = await getSqlPool(context);
        const updated = await recipesRepo.updateRecipe(pool, id, body, user);
        if (!updated) return { status: 404, jsonBody: { error: "Not found or not permitted" } };

        try {
            const searchRecipe = await buildSearchRecipe(id, body.title, body.ingredients, body.steps);
            await storeRecipeInSearchIndex(searchRecipe);
        } catch (searchErr) {
            context.error("Failed to update recipe in search index", searchErr);
            return serverError("Failed to update recipe in search index: " + (searchErr as Error).message);
        }

        return ok({ recipe_id: id, message: "Updated" });
    } catch (err: any) {
        context.error("Unhandled error in updateRecipe", err);
        return serverError();
    }
}

export async function deleteRecipe(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const { user, error } = tryGetUser(request);
        if (error) return error;
        const id = parseInt(request.params.id, 10);
        if (isNaN(id)) return badRequest({ error: "Invalid id" });

        const pool = await getSqlPool(context);
        const deleted = await recipesRepo.deleteRecipe(pool, id, user);
        if (!deleted) return { status: 404, jsonBody: { error: "Not found or not permitted" } };

        try {
            await deleteRecipeFromSearchIndex(id.toString());
        } catch (searchErr) {
            context.error("Failed to remove recipe from search index", searchErr);
            return serverError("Failed to remove recipe from search index: " + (searchErr as Error).message);
        }

        return noContent();
    } catch (err: any) {
        context.error("Unhandled error in deleteRecipe", err);
        return serverError();
    }
}

app.http('recipesList', {
    route: "recipes",
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: listRecipes
});

app.http('recipesGet', {
    route: "recipes/{id}",
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: getRecipe
});

app.http('recipesCreate', {
    route: "recipes",
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: createRecipe
});

app.http('recipesUpdate', {
    route: "recipes/{id}",
    methods: ['PUT'],
    authLevel: 'anonymous',
    handler: updateRecipe
});

app.http('recipesDelete', {
    route: "recipes/{id}",
    methods: ['DELETE'],
    authLevel: 'anonymous',
    handler: deleteRecipe
});
