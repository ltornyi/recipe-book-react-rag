import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import type { CreateRecipeBody } from '../api/recipes';
import { getRecipe } from '../api/recipes';

export interface RecipeFormValues extends CreateRecipeBody {
  recipe_id?: number;
}

export interface RecipeFormDialogProps {
  open: boolean;
  initial?: RecipeFormValues | null;
  onClose: () => void;
  onSave: (values: RecipeFormValues) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
}

export default function RecipeFormDialog({ open, initial, onClose, onSave, onDelete }: RecipeFormDialogProps) {
  const [values, setValues] = useState<RecipeFormValues>({ title: '', ingredients: '', steps: '', is_public: true });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    //clean up on close
    if (!open) {
      setSaving(false);
      setLoading(false);
    }
    // reset error on open
    if (open) {
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (initial?.recipe_id) {
      // Editing: fetch full recipe data
      setLoading(true);
      getRecipe(initial.recipe_id)
        //map to form values
        .then(full => ({
          recipe_id: full.recipe_id,
          title: full.title,
          description: full.description || '',
          ingredients: full.ingredients,
          steps: full.steps,
          cuisine: full.cuisine || '',
          is_public: full.is_public === 1,
        } as RecipeFormValues))
        .then(full => setValues(full))
        .catch(err => {
          console.error('Failed to load recipe', err);
          // setError(err?.message || 'Failed to load recipe');
          setValues(initial);
        })
        .finally(() => setLoading(false));
    } else if (initial) {
      // New recipe or fallback
      setValues(initial);
    } else {
      // New recipe, reset form
      setValues({ title: '', description: '', ingredients: '', steps: '', cuisine: '', is_public: true });
    }
  }, [initial, open]);

  const handleChange = (k: keyof RecipeFormValues) => (e: any) => {
    const v = k === 'is_public' ? e.target.checked : e.target.value;
    setValues(prev => ({ ...prev, [k]: v }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(values);
      onClose();
    } catch (err: any) {
      console.error('Save failed', err);
      setError(err?.message || 'Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this recipe?');
    if (!confirmed) return;

    setSaving(true);
    setError(null);
    try {
      await onDelete?.(values.recipe_id!);
      onClose();
    } catch (err: any) {
      console.error('Delete failed', err);
      setError(err.message || 'Failed to delete recipe');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{values.recipe_id ? 'Edit Recipe' : 'New Recipe'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <TextField label="Title" value={values.title || ''} onChange={handleChange('title')} fullWidth />
            <TextField label="Cuisine" value={values.cuisine || ''} onChange={handleChange('cuisine')} fullWidth />
            <TextField label="Description" value={values.description || ''} onChange={handleChange('description')} fullWidth multiline minRows={2} />
            <TextField label="Ingredients" value={values.ingredients || ''} onChange={handleChange('ingredients')} fullWidth multiline minRows={3} />
            <TextField label="Steps" value={values.steps || ''} onChange={handleChange('steps')} fullWidth multiline minRows={4} />
            <FormControlLabel control={<Switch checked={!!values.is_public} onChange={handleChange('is_public')} />} label="Public" />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving || loading}>Cancel</Button>
        {values.recipe_id && (
            <Button onClick={handleDelete} color="error" disabled={saving || loading || !values.recipe_id}>Delete</Button>
        )}
        <Button onClick={handleSave} variant="contained" disabled={saving || loading || !values.title || !values.ingredients || !values.steps}>{saving ? 'Saving...' : 'Save'}</Button>
      </DialogActions>
    </Dialog>
  );
}
