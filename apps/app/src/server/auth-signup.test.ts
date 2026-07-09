import { beforeEach, describe, expect, it, vi } from "vitest";

const userFindUniqueMock = vi.fn();
const userCreateMock = vi.fn();
const membershipFindFirstMock = vi.fn();
const membershipCreateMock = vi.fn();
const tenantCreateMock = vi.fn();
const workspaceFindFirstMock = vi.fn();
const refreshTokenCreateMock = vi.fn();

vi.mock("./prisma", () => ({
  getPrisma: () => ({
    portalOtpCode: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: userFindUniqueMock,
      create: userCreateMock,
    },
    membership: {
      findFirst: membershipFindFirstMock,
      create: membershipCreateMock,
    },
    tenant: {
      create: tenantCreateMock,
    },
    workspace: {
      findFirst: workspaceFindFirstMock,
    },
    refreshToken: {
      create: refreshTokenCreateMock,
    },
  }),
}));

describe("passwordless signup context", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userFindUniqueMock.mockResolvedValue(null);
    userCreateMock.mockResolvedValue({
      id: "user-1",
      email: "new-user@example.com",
      name: "New User",
    });
    membershipFindFirstMock.mockResolvedValue(null);
    tenantCreateMock.mockResolvedValue({
      id: "tenant-1",
      name: "New Company",
      roles: [{ id: "role-owner" }],
      workspaces: [{ id: "workspace-1" }],
    });
    membershipCreateMock.mockResolvedValue({
      tenantId: "tenant-1",
      tenant: { name: "New Company" },
    });
    refreshTokenCreateMock.mockResolvedValue({ id: "refresh-1" });
  });

  it("creates tenant, owner membership, default workspace context, and then issues a session", async () => {
    const { handleVerifyCode } = await import("./auth");
    const response = await handleVerifyCode(
      new Request("http://test.local/auth/verify-code", {
        method: "POST",
        body: JSON.stringify({
          email: "new-user@example.com",
          code: "111111",
          mode: "signup",
          tenantName: "New Company",
          userName: "New User",
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(tenantCreateMock).toHaveBeenCalled();
    expect(membershipCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: "tenant-1",
          userId: "user-1",
          roleId: "role-owner",
        }),
      }),
    );
    expect(refreshTokenCreateMock).toHaveBeenCalled();
    expect(body).toMatchObject({
      userId: "user-1",
      email: "new-user@example.com",
      tenantId: "tenant-1",
      tenantName: "New Company",
      workspaceId: "workspace-1",
    });
    expect(typeof body.accessToken).toBe("string");
    expect(typeof body.refreshToken).toBe("string");
  });
});
