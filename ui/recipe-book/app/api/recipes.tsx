export interface RecipeSummary {
  recipe_id: number;
  title: string;
  description?: string | null;
  cuisine?: string | null;
  created_by_user_id?: string | null;
  created_by_user_email?: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecipesListResponse {
  total: number;
  page: number;
  pageSize: number;
  items: RecipeSummary[];
}

export interface FetchRecipesOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  q?: string; // cross-column search
  filters?: Record<string, string | number | boolean>;
}

function buildQuery(opts: FetchRecipesOptions): string {
  const params = new URLSearchParams();
  if (opts.page !== undefined) params.set('page', String(opts.page));
  if (opts.pageSize !== undefined) params.set('pageSize', String(opts.pageSize));
  if (opts.sortBy) params.set('sortBy', opts.sortBy);
  if (opts.sortDir) params.set('sortDir', opts.sortDir);
  if (opts.q) params.set('q', opts.q);
  if (opts.filters) {
    for (const [k, v] of Object.entries(opts.filters)) {
      params.set(`filter_${k}`, String(v));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function fetchRecipes(opts: FetchRecipesOptions = {}): Promise<RecipesListResponse> {
  const qs = buildQuery(opts);
  const res = await fetch(`/api/recipes${qs}`, {
    method: 'GET',
    credentials: 'include', // include cookies/auth to access private items when available
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch recipes: ${res.status} ${res.statusText} ${text}`);
  }

  const data = (await res.json()) as RecipesListResponse;
  return data;
}

export interface CreateRecipeBody {
  title: string;
  description?: string | null;
  ingredients: string;
  steps: string;
  cuisine?: string | null;
  is_public?: boolean;
}

export async function createRecipe(body: CreateRecipeBody): Promise<{ recipe_id: number }>{
  const res = await fetch(`/api/recipes`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Create recipe failed: ${res.status} ${res.statusText} ${text}`);
  }
  return res.json();
}

export async function getRecipe(id: number): Promise<RecipeSummary & { ingredients: string; steps: string; description?: string | null }> {
  const res = await fetch(`/api/recipes/${id}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Get recipe failed: ${res.status} ${res.statusText} ${text}`);
  }
  return res.json();
}

export async function updateRecipe(id: number, body: Partial<CreateRecipeBody>): Promise<void> {
  const res = await fetch(`/api/recipes/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Update recipe failed: ${res.status} ${res.statusText} ${text}`);
  }
}

export async function deleteRecipe(id: number): Promise<void> {
  const res = await fetch(`/api/recipes/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Delete recipe failed: ${res.status} ${res.statusText} ${text}`);
  }
}
