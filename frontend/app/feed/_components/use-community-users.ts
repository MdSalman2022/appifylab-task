"use client";

import { useQuery } from "@tanstack/react-query";

import { listCommunityUsers } from "../../_lib/users/user-client";

export const communityUsersQueryKey = ["users"] as const;

export function useCommunityUsers() {
  return useQuery({
    queryKey: communityUsersQueryKey,
    queryFn: () => listCommunityUsers(8),
    staleTime: 5 * 60 * 1000,
  });
}

const roleByName: Record<string, string> = {
  "Steve Jobs": "CEO of Apple",
  "Ryan Roslansky": "CEO of Linkedin",
  "Dylan Field": "CEO of Figma",
  "Radovan SkillArena": "Founder & CEO at Trophy",
  "Karim Saif": "Product Designer",
};

export function communityRole(fullName: string) {
  return roleByName[fullName] ?? "BuddyScript member";
}
