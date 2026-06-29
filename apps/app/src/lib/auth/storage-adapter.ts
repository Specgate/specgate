import { TokenStorage } from "@corely/auth-client";

const ACCESS_TOKEN_KEY = "launchos_access_token";
const REFRESH_TOKEN_KEY = "launchos_refresh_token";
const WORKSPACE_ID_KEY = "launchos_workspace_id";

export class WebStorageAdapter implements TokenStorage {
  async getAccessToken(): Promise<string | null> {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  async getRefreshToken(): Promise<string | null> {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  async setAccessToken(token: string): Promise<void> {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
  async setRefreshToken(token: string): Promise<void> {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
  async getActiveWorkspaceId(): Promise<string | null> {
    return localStorage.getItem(WORKSPACE_ID_KEY);
  }
  async setActiveWorkspaceId(workspaceId: string | null): Promise<void> {
    if (workspaceId) {
      localStorage.setItem(WORKSPACE_ID_KEY, workspaceId);
    } else {
      localStorage.removeItem(WORKSPACE_ID_KEY);
    }
  }
  async clear(): Promise<void> {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(WORKSPACE_ID_KEY);
  }
}
