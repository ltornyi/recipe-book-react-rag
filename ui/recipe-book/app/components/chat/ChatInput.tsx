import { Box, Button, TextField } from "@mui/material";

export default function ChatInput({
  value,
  loading,
  onChange,
  onSend,
}: {
  value: string;
  loading: boolean;
  onChange: (v: string) => void;
  onSend: () => void;
}) {
  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder="Ask about recipes…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
      />
      <Button
        variant="contained"
        disabled={!value.trim() || loading}
        onClick={onSend}
      >
        Send
      </Button>
    </Box>
  );
}