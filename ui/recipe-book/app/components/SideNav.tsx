// app/components/SideNav.tsx

import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  useTheme,
  useMediaQuery,
  Box,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router";

interface SideNavProps {
  appBarHeight?: number;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const drawerWidth = 240;

const navItems = [
  { label: "Recipe maintenance", path: "/home/recipes" },
  { label: "Semantic search", path: "/home/semantic-search" },
  { label: "AI chat", path: "/home/ai-chat" },
];

export default function SideNav({ appBarHeight = 0, mobileOpen = false, onMobileClose }: SideNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleItemClick = (path: string) => {
    navigate(path);
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const drawer = (
    <>
      <Toolbar sx={{ minHeight: `${appBarHeight}px !important` }} />
      <List>
        {navItems.map(item => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => handleItemClick(item.path)}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </>
  );

  return (
    <Box component="nav">
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            marginTop: `${appBarHeight}px`,
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
