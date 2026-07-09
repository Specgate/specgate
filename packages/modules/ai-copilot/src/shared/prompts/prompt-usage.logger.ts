import { Injectable } from "@nestjs/common";
@Injectable()
export class PromptUsageLogger {
  async logUsage(usage: Record<string, unknown>, context?: Record<string, unknown>) {}
}
