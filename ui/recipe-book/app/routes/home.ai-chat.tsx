import type { Route } from "./+types/home.ai-chat";
import { useState } from "react";
import {Box, Typography, CircularProgress, Alert} from "@mui/material";

import { handleUserMessage, type ChatMessage } from "~/api/chat";
import ChatMessageList from "~/components/chat/ChatMessageList";
import ChatInput from "~/components/chat/ChatInput";
import RecipeFormDialog from "~/components/RecipeFormDialog";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI chat" }
  ];
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]); // for UI display
  const [apiConversation, setApiConversation] = useState<ChatMessage[]>([]); // for API calls
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const handleOpenRecipe = (recipeId: number) => {
    setEditing({recipe_id: recipeId});
    setDialogOpen(true);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const { reformulatedUserMessage, assistantMessage } = await handleUserMessage(userMessage.content, apiConversation);
      setApiConversation(prev => [...prev, reformulatedUserMessage, assistantMessage]);
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Chat failed", err);
      setError(err.message || "Chat failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="h4" gutterBottom>
        AI chat
      </Typography>

      <Box sx={{ flex: 1, overflowY: "auto", mb: 2 }}>
        <ChatMessageList messages={messages} onSourceClick={handleOpenRecipe}/>

        {loading && (
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              AI is thinking…
            </Typography>
          </Box>
        )}
      </Box>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      <ChatInput
        value={input}
        loading={loading}
        onChange={setInput}
        onSend={handleSend}
      />

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
