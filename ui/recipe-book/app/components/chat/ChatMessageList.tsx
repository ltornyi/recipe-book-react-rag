import { Box, Stack } from "@mui/material";
import type { ChatMessage } from "~/api/chat";
import UserBubble from "./UserBubble";
import AssistantBubble from "./AssistantBubble";

interface ChatMessageListProps {
  messages: ChatMessage[];
  onSourceClick?: (recipeId: number) => void; // new prop
}

export default function ChatMessageList({ messages, onSourceClick }: ChatMessageListProps) {
  return (
    <Stack spacing={2}>
      {messages.map((m) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
          }}
        >
          {m.role === "user" ? (
            <UserBubble message={m} />
          ) : (
            <AssistantBubble message={m} onSourceClick={onSourceClick}/>
          )}
        </Box>
      ))}
    </Stack>
  );
}