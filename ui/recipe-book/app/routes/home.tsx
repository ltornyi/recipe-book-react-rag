import { Outlet, Navigate } from "react-router";
import { Box } from "@mui/material";
import AppHeader from "../components/AppHeader";
import SideNav from "../components/SideNav";
import { useAuth } from "../auth/useAuth";
import RequireDomainAuth from "~/auth/RequireDomainAuth";

export default function HomeLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/" replace />;

  return (
    <RequireDomainAuth>
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <AppHeader />

      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <SideNav appBarHeight={50}/>

        <Box
          component="main"
          sx={{ flex: 1, p: 2, overflow: "auto"}}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
    </RequireDomainAuth>
  );
}
