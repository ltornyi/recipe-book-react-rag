import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { useAuth } from "~/auth/useAuth";

export default function AppHeader() {
  const { user } = useAuth();
  
  const handleLogout = () => {
    window.location.href = "/logout?post_logout_redirect_uri=/";
  };

  return (
    <AppBar position="static" elevation={1} color="primary">
      <Toolbar variant="dense">
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Recipe Book
        </Typography>

        {user?.userDetails && (
          <Typography variant="body2" sx={{ mr: 2, fontStyle: "italic" }}>
            {user.userDetails}:{user.userId}
          </Typography>
        )}

        <Box>
          <Button color="inherit" size="small" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
