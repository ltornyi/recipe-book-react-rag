// app/components/SideNav.tsx

import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router";

interface SideNavProps {
  appBarHeight?: number;
}

const drawerWidth = 240;

const navItems = [
  { label: "Recipe maintenance", path: "/home/recipes" },
  { label: "Semantic search", path: "/home/semantic-search" },
  { label: "AI chat", path: "/home/ai-chat" },
];

export default function SideNav({ appBarHeight = 0 }: SideNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          marginTop: `${appBarHeight}px`,
        },
      }}
    >

      <List>
        {navItems.map(item => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
