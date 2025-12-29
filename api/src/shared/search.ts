import { AzureKeyCredential, SearchClient } from "@azure/search-documents";

export type SearchRecipe = {
    id: string;
    title: string;
    ingredients: string;
    steps: string;
    embedding: number[];
};

let searchClient: SearchClient<SearchRecipe> = null;

export type SearchResult = SearchRecipe & {
    score: number;
}

export const getSearchClient = () => {
    if (!searchClient) {
        searchClient = new SearchClient(
            process.env.AZURE_SEARCH_SERVICE_ENDPOINT,
            process.env.AZURE_SEARCH_INDEX_NAME,
            new AzureKeyCredential(process.env.AZURE_SEARCH_ADMIN_KEY)
        );
    }
    return searchClient;
};

export const storeRecipeInSearchIndex = async (recipe: SearchRecipe) => {
    const client = getSearchClient();
    await client.mergeOrUploadDocuments([recipe]);
}

export const deleteRecipeFromSearchIndex = async (id: string) => {
    const client = getSearchClient();
    await client.deleteDocuments("id", [id]);
}

const buildVectorSearchOptions = (topK: number, queryEmbedding: number[]) => {
    const options = {
        select: ["id", "title", "ingredients", "steps"],
        top: topK,
        vectorSearchOptions: {
            queries: [
                {
                    kind: "vector",
                    vector: queryEmbedding,
                    exhaustive: true,
                    kNearestNeighborsCount: 50,
                    fields: ["embedding"],
                    //   threshold: { 
                    //     kind: "vectorSimilarity", 
                    //     value: 0.7
                    //   }
                }
            ]
        }
    };

    return options;
};

const executeSearch = async (query: string, options: any) => {
    const client = getSearchClient();
    
    const results = await client.search(query, options);

    const hits: SearchResult[] = [];
    for await (const result of results.results) {
        hits.push({...result.document, score: result.score} as SearchResult);
    }
    return hits;
};

export const vectorSearchRecipes = async (topK: number, queryEmbedding: number[]) => {
    const options = buildVectorSearchOptions(topK, queryEmbedding);

    const hits = await executeSearch("*", options);
    return hits
};

export const keywordSearchRecipes = async (topK: number, query: string) => {
    const options = {
        select: ["id", "title", "ingredients", "steps"],
        top: topK,
        searchMode: "all",
        includeTotalCount: true,
    };

    const hits = await executeSearch(query, options);
    return hits
};

export const hybridSearchRecipes = async (topK: number, query: string, queryEmbedding: number[]) => {
    const options = buildVectorSearchOptions(topK, queryEmbedding);
    options["searchMode"] = "all";
    options["includeTotalCount"] = true;

    const hits = await executeSearch(query, options);
    return hits
};