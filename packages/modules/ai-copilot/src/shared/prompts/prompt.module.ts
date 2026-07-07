import { Module } from "@nestjs/common";
import { PromptUsageLogger } from "./prompt-usage.logger";

@Module({
  providers: [PromptUsageLogger],
  exports: [PromptUsageLogger],
})
export class PromptModule {}
