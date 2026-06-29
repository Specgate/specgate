import type {
  BuildCycleDto,
  BuildQueueItemDto,
  MilestoneDto,
} from "@corely/contracts/specgate";
import type {
  BuildCycleRecord,
  BuildQueueItemRecord,
  MilestoneRecord,
} from "../domain/entities/planning";

const iso = (value: Date | null) => (value ? value.toISOString() : null);

export const mapMilestone = (row: MilestoneRecord): MilestoneDto => ({
  ...row,
  targetDate: iso(row.targetDate),
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export const mapBuildCycle = (row: BuildCycleRecord): BuildCycleDto => ({
  ...row,
  startDate: iso(row.startDate),
  endDate: iso(row.endDate),
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export const mapBuildQueueItem = (
  row: BuildQueueItemRecord,
): BuildQueueItemDto => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});
