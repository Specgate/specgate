import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthClient } from "./auth-client";
import type { TokenStorage } from "./storage/storage.interface";

class MemoryStorage implements TokenStorage {
  accessToken: string | null = null;
  refreshToken: string | null = null;
  workspaceId: string | null = null;

  async setAccessToken(token: string): Promise<void> {
    this.accessToken = token;
  }

  async getAccessToken(): Promise<string | null> {
    return this.accessToken;
  }

  async setRefreshToken(token: string): Promise<void> {
    this.refreshToken = token;
  }

  async getRefreshToken(): Promise<string | null> {
    return this.refreshToken;
  }

  async setActiveWorkspaceId(workspaceId: string | null): Promise<void> {
    this.workspaceId = workspaceId;
  }

  async getActiveWorkspaceId(): Promise<string | null> {
    return this.workspaceId;
  }

  async clear(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
    this.workspaceId = null;
  }
}

describe("AuthClient session handling", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("refresh preserves the existing refresh token when the API returns only a new access token", async () => {
    const storage = new MemoryStorage();
    const client = new AuthClient({ apiUrl: "", storage });
    await storage.setAccessToken("old-access");
    await storage.setRefreshToken("refresh-token");
    await client.loadStoredTokens();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ accessToken: "new-access" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    await client.refreshAccessToken();

    expect(storage.accessToken).toBe("new-access");
    expect(storage.refreshToken).toBe("refresh-token");
    expect(client.getRefreshToken()).toBe("refresh-token");
  });

  it("signout clears stored auth state", async () => {
    const storage = new MemoryStorage();
    const client = new AuthClient({ apiUrl: "", storage });
    await storage.setAccessToken("access-token");
    await storage.setRefreshToken("refresh-token");
    await storage.setActiveWorkspaceId("workspace-1");
    await client.loadStoredTokens();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    );

    await client.signout();

    expect(storage.accessToken).toBeNull();
    expect(storage.refreshToken).toBeNull();
    expect(storage.workspaceId).toBeNull();
  });
});
