export interface RecipeSearchRequest {
    query: string;
    mode: "vector" | "keyword" | "hybrid";
    topK: number;
};

export interface RecipeSearchResult {
    id: string;
    title: string;
    ingredients: string;
    steps: string;
    score: number;
};

export async function searchRecipes(req: RecipeSearchRequest): Promise<RecipeSearchResult[]> {
  const res = await fetch(`/api/recipes/search`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Recipe search failed: ${res.status} ${res.statusText} ${text}`);
  }

  const data = (await res.json()) as RecipeSearchResult[];
  return data;
}