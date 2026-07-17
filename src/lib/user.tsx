"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type MeUser = {
  id: number;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN" | "SUPERADMIN";
  phone?: string | null;
  address?: string | null;
} | null;

type UserContextType = {
  user: MeUser;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MeUser>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <UserContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
