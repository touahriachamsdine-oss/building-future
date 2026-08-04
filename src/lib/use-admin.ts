"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "./auth";

/**
 * Client-side admin guard for client-rendered admin pages. Redirects to
 * /login when the current user is not an ADMIN. Server-side enforcement
 * still lives in the admin db functions and the proxy.
 */
export function useAdminGuard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((user) => {
        if (!active) return;
        if (!user || user.role !== "ADMIN") {
          router.replace("/login");
          return;
        }
        setIsAdmin(true);
        setLoading(false);
      })
      .catch(() => {
        if (active) router.replace("/login");
      });
    return () => {
      active = false;
    };
  }, [router]);

  return { isAdmin, loading };
}
