import type { Route } from "./+types/home.semantic-search";
import { useState } from "react";
import {
  Box,
  TextField,
  Paper,
  Typography,
  CircularProgress,
  Button,
  MenuItem,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { searchRecipes, type RecipeSearchResult } from "../api/recipeSearch";
import RecipeFormDialog from "../components/RecipeFormDialog";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Semantic search" }
  ];
}

function shortenText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}

const columns: GridColDef[] = [
  { field: "title", headerName: "Title", flex: 1, minWidth: 200 },
  { field: "ingredients", headerName: "Ingredients", flex: 1, minWidth: 200, valueGetter: (ing: any) => shortenText(ing, 50) },
  { field: "steps", headerName: "Steps", flex: 1, minWidth: 200, valueGetter: (steps: any) => shortenText(steps, 50) },
  { field: "score", headerName: "Score", type: "number", width: 120 },
];

export default function SemanticSearchPage() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"vector" | "keyword" | "hybrid">("vector");
  const [topK, setTopK] = useState(10);
  const [results, setResults] = useState<RecipeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchRecipes({ query, mode, topK });
      setResults(res);
    } catch (err: any) {
      console.error("Search failed", err);
      setError(err.message || "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleRowDoubleClick = (params: any) => {
    setEditing({
      recipe_id: params.row.id,
      title: params.row.title,
      ingredients: params.row.ingredients,
      steps: params.row.steps,
    });
    setDialogOpen(true);
  };

  // return <Typography variant="h4">Semantic search (coming soon)</Typography>;
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Semantic search
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <TextField
          label="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          fullWidth
        />
        <TextField
          select
          label="Mode"
          value={mode}
          onChange={(e) => setMode(e.target.value as any)}
          size="small"
          sx={{ width: 120 }}
        >
          <MenuItem value="vector">Vector</MenuItem>
          <MenuItem value="keyword">Keyword</MenuItem>
          <MenuItem value="hybrid">Hybrid</MenuItem>
        </TextField>
        <Button variant="contained" onClick={handleSearch} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Search"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper style={{ height: 650 }}>
        <DataGrid
          rows={results}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          pageSizeOptions={[5, 10, 20]}
          paginationModel={{ pageSize: 10, page: 0 }}
          onRowDoubleClick={handleRowDoubleClick}
        />
      </Paper>

      <RecipeFormDialog
        open={dialogOpen}
        initial={editing}
        onClose={() => setDialogOpen(false)}
        onSave={async () => setDialogOpen(false)}
        onDelete={async () => setDialogOpen(false)}
      />
    </Box>
  );
}
