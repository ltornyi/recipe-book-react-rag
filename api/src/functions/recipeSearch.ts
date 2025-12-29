import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { badRequest, notImplemented, ok, serverError } from "../shared/responseHelpers.js";
import { tryGetUser } from "../shared/auth.js";
import { validateRecipeSearch } from "../shared/validate.js";
import { hybridSearchRecipes, keywordSearchRecipes, SearchResult, vectorSearchRecipes } from "../shared/search.js";
import { generateEmbedding } from "../shared/openAI.js";

export type RecipeSearchRequestBody = {
    query: string;
    mode: "vector" | "keyword" | "hybrid";
    topK: number;
};

async function executeSearch(searchReq: RecipeSearchRequestBody): Promise<HttpResponseInit> {
    let result: SearchResult[];
    switch (searchReq.mode) {
        case "vector":
            result = await vectorSearchRecipes(searchReq.topK, await generateEmbedding(searchReq.query));
            break;
        case "keyword":
            result = await keywordSearchRecipes(searchReq.topK, searchReq.query);
            break;
        case "hybrid":
            result = await hybridSearchRecipes(searchReq.topK, searchReq.query, await generateEmbedding(searchReq.query));
            break;
        default:
            return badRequest({ error: "Invalid search mode" });
    }

    return ok(result);
}

export async function searchRecipe(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const { user, error } = tryGetUser(request);
        if (error) return error;

        let body: RecipeSearchRequestBody;
        try {
            body = await request.json() as RecipeSearchRequestBody;
        } catch (parseErr) {
            return badRequest({ error: "Invalid JSON body" });
        }

        const validationError = validateRecipeSearch(body);
        if (validationError) return badRequest(validationError);

        const { query, mode, topK = 10 } = body;
        const searchReq = { query, mode, topK };
        return await executeSearch(searchReq);
    } catch (err: any) {
        context.error("Unhandled error in searchRecipe", err);
        return serverError();
    }
}

app.http('recipesSearch', {
    route: "recipes/search",
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: searchRecipe
});