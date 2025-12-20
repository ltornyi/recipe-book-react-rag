import type { Route } from "./+types/index";
import { Box, Button, Typography } from "@mui/material";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Recipe Book" }
  ];
}

export default function LoginPage() {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <Typography variant="h3">Recipe Book</Typography>
      <Button
        variant="contained"
        onClick={() => (window.location.href = "/login?post_login_redirect_uri=/home/recipes")}
      >
        Log in
      </Button>
    </Box>
  );
}
