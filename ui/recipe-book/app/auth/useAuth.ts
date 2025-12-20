// app/auth/useAuth.ts

import { useEffect, useState } from "react";

interface MeResponse {
  userId: string;
  userDetails: string;
  identityProvider: string;
  userRoles: string[];
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<MeResponse | null>(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("/.auth/me", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch auth info");

        const meData = await res.json();

        console.log("Fetched /.auth/me data:", meData);

        if (meData?.clientPrincipal) {
          const principal = meData.clientPrincipal;
          const currentUser: MeResponse = {
            userId: principal.userId,
            userDetails: principal.userDetails,
            identityProvider: principal.identityProvider,
            userRoles: principal.userRoles,
          };

          setUser(currentUser);

          // Treat user as authenticated if roles include "authenticated"
          setIsAuthenticated(principal.userRoles.includes("authenticated"));
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMe();
  }, []);

  return { isAuthenticated, isLoading, user };
}
