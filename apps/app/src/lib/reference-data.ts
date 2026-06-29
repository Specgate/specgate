import type { DemoState, Project, User } from "@/types/specgate";

export const fallbackProjects: Project[] = [
  { id: "launchos", name: "LaunchOS" },
  { id: "talelingo", name: "TaleLingo" },
  { id: "corelynext", name: "CorelyNext" },
];

export const users: User[] = [
  { id: "u-ha", name: "Ha", role: "Founder", avatar: "H", type: "admin" },
  { id: "u-anna", name: "Anna", role: "Stakeholder", avatar: "A", type: "stakeholder" },
  { id: "u-david", name: "David", role: "Developer", avatar: "D", type: "developer" },
  { id: "u-linh", name: "Linh", role: "Designer", avatar: "L", type: "stakeholder" },
  { id: "u-minh", name: "Minh", role: "Product Lead", avatar: "M", type: "product_lead" },
];

const usersById = new Map(users.map((user) => [user.id, user]));

export function getUserDisplay(userId?: string | null): User | null {
  if (!userId) return null;
  return (
    usersById.get(userId) ?? {
      id: userId,
      name: userId,
      avatar: userId.slice(0, 2).toUpperCase(),
      role: "Unknown user",
      type: "unknown",
    }
  );
}

export const initialState: DemoState = {
  mode: "team",
  currentProjectId: "",
  projects: fallbackProjects,
  specs: [],
  comments: [],
  decisions: [],
  assets: [],
  specChecks: [],
  previewReviews: [],
  activities: [],
  buildCycles: [],
  milestones: [],
};
