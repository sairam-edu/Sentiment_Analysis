import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HfInference } from '@huggingface/inference';
import { huggingFaceService } from '../services/huggingface';

vi.mock('@huggingface/inference');

describe('HuggingFace Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful sentiment analysis', async () => {
    const mockResponse = [{
      label: 'POSITIVE',
      score: 0.95
    }];

    vi.spyOn(HfInference.prototype, 'textClassification')
      .mockResolvedValue(mockResponse);

    const result = await huggingFaceService.analyzeSentiment('Great product!');
    
    expect(result.label).toBe('POSITIVE');
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('should handle rate limiting', async () => {
    const service = huggingFaceService;
    const limit = service.getRateLimit().limit;

    // Simulate hitting rate limit
    for (let i = 0; i < limit + 1; i++) {
      try {
        await service.analyzeSentiment('test');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('Rate limit exceeded');
      }
    }
  });

  it('should handle batch processing', async () => {
    const texts = ['Text 1', 'Text 2', 'Text 3'];
    const results = await huggingFaceService.analyzeBatch(texts);
    
    expect(results).toHaveLength(texts.length);
    results.forEach(result => {
      expect(result).toHaveProperty('label');
      expect(result).toHaveProperty('confidence');
    });
  });
});