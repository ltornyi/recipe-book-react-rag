import type { Route } from "./+types/home.recipes";
import { Typography } from "@mui/material";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Recipe maintenance" }
  ];
}

export default function RecipesPage() {
  return <Typography variant="h4">Recipe maintenance (coming soon)</Typography>;
}
