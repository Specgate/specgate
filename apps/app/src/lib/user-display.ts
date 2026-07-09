import type { User } from "@/types/specgate";

export function getUserDisplay(userId?: string | null): User | null {
  if (!userId) return null;
  return {
    id: userId,
    name: userId,
    avatar: userId.slice(0, 2).toUpperCase(),
    role: "User",
    type: "unknown",
  };
}
