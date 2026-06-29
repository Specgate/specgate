import { handleApi } from "@/server/specgateApi";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const POST = (request: Request) =>
  handleApi(request, ({ runtime }) => {
    if (
      process.env.NODE_ENV === "production" &&
      process.env.SPECGATE_DEMO_MODE !== "true"
    )
      throw new Error("SpecGate demo reset is disabled in production.");
    return runtime.demo.reset();
  });
