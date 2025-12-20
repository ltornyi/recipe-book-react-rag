// app/auth/RequireDomainAuth.tsx
import type { ReactNode } from "react";
import { useAuth } from "./useAuth";
import { Box, Button, Typography } from "@mui/material";

interface Props {
  children: ReactNode;
}

export default function RequireDomainAuth({ children }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth();

  const allowedDomain = import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN;

  if (isLoading) return null;

  if (!isAuthenticated) {
    // Not logged in, redirect to login page
    window.location.href = "/"; 
    return null;
  }

  // Check domain
  if (user?.userDetails?.endsWith(allowedDomain)) {
    return <>{children}</>;
  }

  // Forbidden
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <Typography variant="h4" color="error">
        Forbidden
      </Typography>
      <Typography variant="body1">
        You are not authorized to use this app.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() =>
          (window.location.href =
            "/.auth/logout?post_logout_redirect_uri=/")
        }
      >
        Logout
      </Button>
    </Box>
  );
}
