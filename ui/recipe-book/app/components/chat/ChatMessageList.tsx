import { Box, Stack } from "@mui/material";
import type { ChatMessage } from "~/api/chat";
import UserBubble from "./UserBubble";
import AssistantBubble from "./AssistantBubble";

export default function ChatMessageList({ messages }: { messages: ChatMessage[] }) {
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
            <AssistantBubble message={m} />
          )}
        </Box>
      ))}
    </Stack>
  );
}