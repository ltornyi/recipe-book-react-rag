import type { Route } from "./+types/home.recipes";
import { useCallback, useEffect, useState } from "react";
import {
  Box,
  TextField,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Alert,
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import {fetchRecipes, createRecipe, updateRecipe, deleteRecipe } from "../api/recipes";
import type { RecipeSummary } from "../api/recipes";
import RecipeFormDialog from "../components/RecipeFormDialog";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Recipe maintenance" }];
}

export default function RecipesPage() {
  const [allRecipes, setAllRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  // Fetch recipes from server with search query
  const loadRecipes = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchRecipes({ 
        pageSize: 10000,
        q: search || undefined
      });
      setAllRecipes(res);
    } catch (err: any) {
      console.error('Failed to load recipes', err);
      setError(err.message || 'Failed to load recipes');
      setAllRecipes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecipes(debouncedQ);
  }, [debouncedQ, loadRecipes]);

  const columns: GridColDef[] = [
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 200 },
    { field: 'created_by_user_email', headerName: 'Creator', width: 220 },
    { field: 'cuisine', headerName: 'Cuisine', width: 140 },
    { field: 'created_at', headerName: 'Created', type: 'dateTime',width: 200, valueGetter: (params: any) => params ? new Date(params) : null },
    { field: 'is_public', headerName: 'Public', type: 'boolean', width: 100 },
  ];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const handleRowDoubleClick = (params: any) => {
    setEditing(params.row);
    setDialogOpen(true);
  };

  const handleSave = async (values: any) => {
    try {
      if (values.recipe_id) {
        const { recipe_id, ...body } = values;
        await updateRecipe(recipe_id, body);
      } else {
        const { recipe_id, ...body } = values;
        console.log('Creating recipe with body', body);
        await createRecipe(body);
      }
      // Reload recipes with current search
      await loadRecipes(debouncedQ);
    } catch (err) {
      console.error('Save failed', err);
      throw err;
    }
  };

  const handleDelete = async (recipeId: number) => {
    try {
      await deleteRecipe(recipeId);
    } catch (err) {
      console.error('Delete failed', err);
      throw err;
    }
    // Reload recipes with current search
    await loadRecipes(debouncedQ);
  }

  const handleRetry = async () => {
    await loadRecipes(debouncedQ);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>Recipe maintenance</Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2, alignItems: 'center' }}>
        <TextField label="Search" value={q} onChange={(e) => setQ(e.target.value)} size="small" sx={{ width: 360 }} />
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {loading && <CircularProgress size={24} />}
          <Button variant="contained" onClick={() => { setEditing(null); setDialogOpen(true); }}>New Recipe</Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}
            action={
                <Button size="small" onClick={handleRetry}>Retry</Button>
            }
        >
            {error}
        </Alert>
        )}


      <Paper style={{ height: 650 }}>
        <DataGrid
          rows={allRecipes}
          columns={columns}
          loading={loading}
          paginationMode="client"
          sortingMode="client"
          onRowDoubleClick={handleRowDoubleClick}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } }
          }}
          pageSizeOptions={[5,10,20,50]}
          disableColumnSelector
          getRowId={(row) => row.recipe_id}
        />
      </Paper>

      <RecipeFormDialog
        open={dialogOpen}
        initial={editing}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </Box>
  );
}
