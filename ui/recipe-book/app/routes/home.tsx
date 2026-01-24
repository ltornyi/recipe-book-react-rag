import { Outlet, Navigate } from "react-router";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import AppHeader from "../components/AppHeader";
import SideNav from "../components/SideNav";
import { useAuth } from "../auth/useAuth";
import RequireDomainAuth from "~/auth/RequireDomainAuth";
import { useState } from "react";

export default function HomeLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/" replace />;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <RequireDomainAuth>
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <AppHeader onMenuClick={isMobile ? handleDrawerToggle : undefined} />

      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <SideNav 
          appBarHeight={50}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <Box
          component="main"
          sx={{ 
            flex: 1, 
            p: { xs: 1, sm: 2 }, 
            overflow: "auto",
            ml: { xs: 0, md: '240px' }
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
    </RequireDomainAuth>
  );
}
