import type { ActivityType } from "@corely/contracts/specgate";
import type { ActivityRecord } from "../../domain/entities/activity";
import type { ActivityRepositoryPort } from "../../application/ports/activity-repository.port";

type ModelClient = {
  findMany(args?: unknown): Promise<any[]>;
  create(args: unknown): Promise<any>;
};

export class PrismaActivityRepository implements ActivityRepositoryPort {
  constructor(private readonly prisma: { specGateActivity: ModelClient }) {}
  async record(activity: ActivityRecord) {
    const { metadata, ...data } = activity;
    await this.prisma.specGateActivity.create({
      data: { ...data, metadataJson: metadata },
    });
  }
  list(
    tenantId: string,
    filters: {
      projectId?: string;
      specId?: string;
      type?: ActivityType;
    },
  ) {
    return this.prisma.specGateActivity
      .findMany({
        where: { tenantId, ...filters },
        orderBy: { createdAt: "desc" },
      })
      .then((rows) =>
        rows.map(
          (row) => ({ ...row, metadata: row.metadataJson }) as ActivityRecord,
        ),
      );
  }
}
