import type { Route } from "./+types/home.recipes";
import { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridSortModel, GridPaginationModel } from '@mui/x-data-grid';
import fetchRecipes from "../api/recipes";
import type { RecipesListResponse } from "../api/recipes";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Recipe maintenance" }];
}

export default function RecipesPage() {
  const [data, setData] = useState<RecipesListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0); // zero-based for MUI
  const [pageSize, setPageSize] = useState(10);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>("title");
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchRecipes({
        page: page + 1,
        pageSize,
        sortBy,
        sortDir,
        q: debouncedQ || undefined,
      });
      setData(res);
    } catch (err) {
      console.error('Failed to load recipes', err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, pageSize, sortBy, sortDir, debouncedQ]);

  const handleSortModelChange = (model: GridSortModel) => {
    if (!model || model.length === 0) {
      setSortBy(undefined);
      setSortDir('asc');
    } else {
      setSortBy(model[0].field);
      setSortDir((model[0].sort as 'asc' | 'desc') || 'asc');
    }
    setPage(0);
  };

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPage(model.page ?? 0);
    if (model.pageSize && model.pageSize !== pageSize) {
      setPageSize(model.pageSize);
      setPage(0);
    }
  };

  const rows = (data?.items ?? []).map(r => ({ ...r, id: r.recipe_id }));

  const columns: GridColDef[] = [
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 200 },
    { field: 'created_by_user_email', headerName: 'Creator', width: 220 },
    { field: 'cuisine', headerName: 'Cuisine', width: 140 },
    { field: 'created_at', headerName: 'Created', width: 200, valueGetter: (params: any) => params ? new Date(params).toLocaleString() : '' },
    { field: 'is_public', headerName: 'Public', width: 100, valueGetter: (p: any) => (p ? 'Yes' : 'No') },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>Recipe maintenance</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <TextField label="Search" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} size="small" />
        {loading && <CircularProgress size={24} />}
      </Box>

      <Paper style={{ height: 600 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          paginationMode="server"
          sortingMode="server"
          rowCount={data?.total ?? 0}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={handlePaginationModelChange}
          sortModel={sortBy ? [{ field: sortBy, sort: sortDir }] : []}
          onSortModelChange={handleSortModelChange}
          pageSizeOptions={[5,10,20,50]}
          disableColumnFilter
          disableColumnSelector
          getRowId={(row) => row.recipe_id}
        />
      </Paper>
    </Box>
  );
}
