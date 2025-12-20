import type { Route } from "./+types/home.semantic-search";
import { Typography } from "@mui/material";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Semantic search" }
  ];
}

export default function SemanticSearchPage() {
  return <Typography variant="h4">Semantic search (coming soon)</Typography>;
}
