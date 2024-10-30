import { HfInference } from '@huggingface/inference';
import { SentimentResult, ApiRateLimit } from '../types';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const MAX_BATCH_SIZE = 10;
const API_RATE_LIMIT = 60; // requests per minute

class HuggingFaceService {
  private hf: HfInference;
  private rateLimit: ApiRateLimit = {
    remaining: API_RATE_LIMIT,
    reset: Date.now() + 60000,
    limit: API_RATE_LIMIT,
  };

  constructor() {
    this.hf = new HfInference(import.meta.env.VITE_HUGGINGFACE_API_KEY);
  }

  private async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private updateRateLimit(): boolean {
    const now = Date.now();
    if (now > this.rateLimit.reset) {
      this.rateLimit = {
        remaining: API_RATE_LIMIT,
        reset: now + 60000,
        limit: API_RATE_LIMIT,
      };
    }
    if (this.rateLimit.remaining <= 0) {
      return false;
    }
    this.rateLimit.remaining--;
    return true;
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries = MAX_RETRIES
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) throw error;
      await this.wait(RETRY_DELAY * (MAX_RETRIES - retries + 1));
      return this.retryWithBackoff(fn, retries - 1);
    }
  }

  async analyzeSentiment(text: string): Promise<SentimentResult> {
    if (!this.updateRateLimit()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    const result = await this.retryWithBackoff(async () => {
      const response = await this.hf.textClassification({
        model: 'SamLowe/roberta-base-go_emotions',
        inputs: text,
      });

      const score = response[0].score;
      const label = response[0].label as 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

      return {
        score: label === 'POSITIVE' ? score : label === 'NEGATIVE' ? -score : 0,
        label,
        confidence: score,
        tokens: text.split(/\s+/),
      };
    });

    return result;
  }

  async analyzeBatch(texts: string[]): Promise<SentimentResult[]> {
    const results: SentimentResult[] = [];
    
    for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
      const batch = texts.slice(i, i + MAX_BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(text => this.analyzeSentiment(text))
      );
      results.push(...batchResults);
      
      if (i + MAX_BATCH_SIZE < texts.length) {
        await this.wait(1000); // Prevent rate limiting
      }
    }

    return results;
  }

  getRateLimit(): ApiRateLimit {
    return { ...this.rateLimit };
  }
}

export const huggingFaceService = new HuggingFaceService();