import { Paper, Typography } from "@mui/material";
import type { ChatMessage } from "~/api/chat";

export default function UserBubble({ message }: { message: ChatMessage }) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        maxWidth: "75%",
        bgcolor: "primary.main",
        color: "primary.contrastText",
      }}
    >
      <Typography variant="body1">{message.content}</Typography>
    </Paper>
  );
}