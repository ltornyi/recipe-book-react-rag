import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import type { ChatMessage } from "~/api/chat";

interface AssistantBubbleProps {
  message: ChatMessage;
  onSourceClick?: (recipeId: number) => void;
}

export default function AssistantBubble({ message, onSourceClick }: AssistantBubbleProps) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        maxWidth: "75%",
        bgcolor: "grey.100",
      }}
    >
      <Typography variant="body1">{message.content}</Typography>

      {message.sources && message.sources.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Sources:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {message.sources.map((s) => (
              <Chip key={s.recipe_id} label={s.title} size="small" clickable onClick={() => onSourceClick?.(s.recipe_id)}/>
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  );
}