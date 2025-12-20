import type { Route } from "./+types/home.ai-chat";
import { Typography } from "@mui/material";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI chat" }
  ];
}

export default function AiChatPage() {
  return <Typography variant="h4">AI chat (coming soon)</Typography>;
}
