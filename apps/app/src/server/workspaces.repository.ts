import { randomUUID } from "node:crypto";
import type { WorkspaceDto } from "@corely/contracts/specgate";

type WorkspaceRow = {
  id: string;
  tenantId: string;
  name: string;
  slug: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type WorkspaceModel = {
  findMany(args: {
    where: { tenantId: string; deletedAt: null };
    orderBy: { createdAt: "asc" };
    select: Record<keyof WorkspaceRow, true>;
  }): Promise<WorkspaceRow[]>;
  create(args: {
    data: {
      id: string;
      tenantId: string;
      name: string;
      slug: string;
      createdAt: Date;
      updatedAt: Date;
    };
    select: Record<keyof WorkspaceRow, true>;
  }): Promise<WorkspaceRow>;
};

type PrismaWorkspaceClient = {
  workspace: WorkspaceModel;
};

const workspaceSelect: Record<keyof WorkspaceRow, true> = {
  id: true,
  tenantId: true,
  name: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function mapWorkspace(row: WorkspaceRow): WorkspaceDto {
  return {
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
    slug: row.slug,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class PrismaWorkspaceRepository {
  constructor(private readonly prisma: PrismaWorkspaceClient) {}

  async listForTenant(tenantId: string): Promise<WorkspaceDto[]> {
    const rows = await this.prisma.workspace.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: "asc" },
      select: workspaceSelect,
    });
    return rows.map(mapWorkspace);
  }

  async createForTenant(tenantId: string, name: string): Promise<WorkspaceDto> {
    const now = new Date();
    const slugBase = slugify(name) || "workspace";
    const row = await this.prisma.workspace.create({
      data: {
        id: randomUUID(),
        tenantId,
        name,
        slug: `${slugBase}-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      },
      select: workspaceSelect,
    });
    return mapWorkspace(row);
  }
}
