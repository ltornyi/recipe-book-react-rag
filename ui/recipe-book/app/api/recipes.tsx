// Client helper for calling the API list endpoint: GET /api/recipes
// Usage: import { fetchRecipes } from '../api/recipes';

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

// Example React usage (in a component):
// import { useEffect, useState } from 'react';
// import { fetchRecipes } from '../api/recipes';
//
// function Example() {
//   const [data, setData] = useState<RecipesListResponse | null>(null);
//   const [loading, setLoading] = useState(false);
//
//   useEffect(() => {
//     setLoading(true);
//     fetchRecipes({ page: 1, pageSize: 12, q: 'chicken', sortBy: 'title', sortDir: 'asc' })
//       .then(d => setData(d))
//       .catch(err => console.error(err))
//       .finally(() => setLoading(false));
//   }, []);
//
//   if (loading) return <div>Loading...</div>;
//   return (
//     <div>
//       <div>Total: {data?.total}</div>
//       <ul>
//         {data?.items.map(r => (
//           <li key={r.recipe_id}>{r.title} — {r.cuisine}</li>
//         ))}
//       </ul>
//     </div>
//   );
// }

export default fetchRecipes;
