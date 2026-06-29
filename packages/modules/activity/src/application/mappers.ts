import type { ActivityDto } from "@corely/contracts/specgate";
import type { ActivityRecord } from "../domain/entities/activity";

export const mapActivity = (row: ActivityRecord): ActivityDto => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
});
