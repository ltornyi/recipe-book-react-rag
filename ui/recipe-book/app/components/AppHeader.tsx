import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useAuth } from "~/auth/useAuth";

interface AppHeaderProps {
  onMenuClick?: () => void;
}

export default function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { user } = useAuth();
  
  const handleLogout = () => {
    window.location.href = "/logout?post_logout_redirect_uri=/";
  };

  return (
    <AppBar position="static" elevation={1} color="primary">
      <Toolbar variant="dense">
        {onMenuClick && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Recipe Book
        </Typography>

        {user?.userDetails && (
          <Typography variant="body2" sx={{ mr: 2, fontStyle: "italic", display: { xs: 'none', sm: 'block' } }}>
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
