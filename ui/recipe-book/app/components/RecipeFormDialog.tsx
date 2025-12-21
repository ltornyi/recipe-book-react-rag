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

  useEffect(() => {
    if (initial?.recipe_id) {
      // Editing: fetch full recipe data
      setLoading(true);
      getRecipe(initial.recipe_id)
        .then(full => setValues(full as RecipeFormValues))
        .catch(err => {
          console.error('Failed to load recipe', err);
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
    try {
      await onSave(values);
      onClose();
    } catch (err) {
      console.error('Save failed', err);
      // ideally show error to user
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await onDelete?.(values.recipe_id!);
      onClose();
    } catch (err) {
      console.error('Delete failed', err);
      // ideally show error to user
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{values.recipe_id ? 'Edit Recipe' : 'New Recipe'}</DialogTitle>
      <DialogContent>
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
