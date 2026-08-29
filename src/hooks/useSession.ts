"use client";

import useSWR from "swr";

export interface SessionUser {
  userId: string;
  email: string;
  name: string;
  role: "student" | "canteen_manager" | "admin";
  canteenId?: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useSession() {
  const { data, error, isLoading, mutate } = useSWR<{ user: SessionUser | null }>(
    "/api/auth/me",
    fetcher
  );
  return {
    user: data?.user ?? null,
    isLoading,
    error,
    refresh: mutate,
  };
}
