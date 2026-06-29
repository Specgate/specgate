import type { DemoState, Project, User } from "@/types/demo";

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
];

export const initialState: DemoState = {
  mode: "team",
  currentProjectId: "",
  projects: fallbackProjects,
  specs: [],
  comments: [],
  activities: [],
  buildCycles: [],
  milestones: [],
};
