import { beforeEach, describe, expect, it, vi } from "vitest";

const verifyJwtMock = vi.fn();
const membershipFindFirstMock = vi.fn();

vi.mock("./auth", () => ({
  verifyJwt: verifyJwtMock,
}));

vi.mock("./prisma", () => ({
  getPrisma: () => ({
    membership: {
      findFirst: membershipFindFirstMock,
    },
  }),
}));

describe("SpecGate request auth context", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.SPECGATE_DEV_AUTH_BYPASS;
    delete process.env.SPECGATE_DEV_TENANT_ID;
    delete process.env.SPECGATE_DEV_USER_ID;
  });

  it("rejects missing tokens with 401", async () => {
    const { getRequestContext } = await import("./specgate");

    await expect(getRequestContext(new Request("http://test.local"))).rejects.toMatchObject({
      type: "unauthorized",
    });
  });

  it("rejects invalid tokens with 401", async () => {
    verifyJwtMock.mockResolvedValue(null);
    const { getRequestContext } = await import("./specgate");

    await expect(
      getRequestContext(
        new Request("http://test.local", {
          headers: { authorization: "Bearer bad-token" },
        }),
      ),
    ).rejects.toMatchObject({ type: "unauthorized" });
  });

  it("rejects valid tokens without tenant membership with 403", async () => {
    verifyJwtMock.mockResolvedValue({ sub: "user-1", tenantId: "tenant-1" });
    membershipFindFirstMock.mockResolvedValue(null);
    const { getRequestContext } = await import("./specgate");

    await expect(
      getRequestContext(
        new Request("http://test.local", {
          headers: { authorization: "Bearer valid-token" },
        }),
      ),
    ).rejects.toMatchObject({ type: "forbidden" });
  });

  it("uses the verified token tenant and ignores spoofed tenant headers", async () => {
    verifyJwtMock.mockResolvedValue({ sub: "user-1", tenantId: "tenant-real" });
    membershipFindFirstMock.mockResolvedValue({ id: "membership-1" });
    const { getRequestContext } = await import("./specgate");

    const ctx = await getRequestContext(
      new Request("http://test.local", {
        headers: {
          authorization: "Bearer valid-token",
          "x-tenant-id": "tenant-spoofed",
          "x-user-id": "user-spoofed",
        },
      }),
    );

    expect(ctx).toEqual({ tenantId: "tenant-real", userId: "user-1" });
    expect(membershipFindFirstMock).toHaveBeenCalledWith({
      where: { userId: "user-1", tenantId: "tenant-real" },
      select: { id: true },
    });
  });

  it("allows dev bypass only when explicitly enabled outside production", async () => {
    process.env.SPECGATE_DEV_AUTH_BYPASS = "true";
    process.env.SPECGATE_DEV_TENANT_ID = "tenant-dev";
    process.env.SPECGATE_DEV_USER_ID = "user-dev";
    const { getRequestContext } = await import("./specgate");

    await expect(getRequestContext(new Request("http://test.local"))).resolves.toEqual({
      tenantId: "tenant-dev",
      userId: "user-dev",
    });
  });
});
