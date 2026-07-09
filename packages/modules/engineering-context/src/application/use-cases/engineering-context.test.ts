import { describe, it, expect, vi } from 'vitest';
import { UpsertEngineeringContextUseCase } from './upsert-engineering-context.use-case';

describe('UpsertEngineeringContextUseCase', () => {
  it('calls upsert and logs activity', async () => {
    const mockRepo = {
      getEngineeringContext: vi.fn().mockResolvedValue(null),
      upsertEngineeringContext: vi.fn().mockResolvedValue({ id: '1' })
    };
    const mockLogger = {
      publish: vi.fn().mockResolvedValue(undefined)
    };

    const useCase = new UpsertEngineeringContextUseCase({
      engineeringContextRepository: mockRepo as unknown as ConstructorParameters<typeof UpsertEngineeringContextUseCase>[0]['engineeringContextRepository'],
      activityLogPort: mockLogger as unknown as ConstructorParameters<typeof UpsertEngineeringContextUseCase>[0]['activityLogPort']
    });

    const result = await useCase.execute('t1', 'u1', { projectId: 'p1', projectSummaryMarkdown: 'Summary' });

    expect(result.id).toBe('1');
    expect(mockRepo.upsertEngineeringContext).toHaveBeenCalled();
    expect(mockLogger.publish).toHaveBeenCalledWith(expect.objectContaining({
      type: 'engineering_context_created'
    }));
  });
});
