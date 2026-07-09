import { afterEach, describe, expect, it, vi } from "vitest";
import { isDevAuthBypassEnabled } from "./dev-auth-bypass";

const originalNodeEnv = process.env.NODE_ENV;

describe("dev auth bypass helper", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    if (originalNodeEnv) {
      vi.stubEnv("NODE_ENV", originalNodeEnv);
    }
    delete process.env.SPECGATE_DEV_AUTH_BYPASS;
  });

  it("is disabled by default", () => {
    expect(isDevAuthBypassEnabled("specgate")).toBe(false);
  });

  it("cannot be enabled in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SPECGATE_DEV_AUTH_BYPASS", "true");

    expect(isDevAuthBypassEnabled("specgate")).toBe(false);
  });
});
