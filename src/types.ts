import { z } from 'zod';

export const SentimentResultSchema = z.object({
  score: z.number(),
  label: z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL']),
  confidence: z.number(),
  tokens: z.array(z.string()),
});

export const AnalysisSchema = z.object({
  id: z.string(),
  text: z.string(),
  timestamp: z.date(),
  result: SentimentResultSchema,
  source: z.enum(['csv', 'manual']),
});

export type SentimentResult = z.infer<typeof SentimentResultSchema>;
export type Analysis = z.infer<typeof AnalysisSchema>;

export interface ChartData {
  name: string;
  positive: number;
  negative: number;
  neutral: number;
}

export interface ValidationError {
  type: 'format' | 'size' | 'structure' | 'content' | 'api';
  message: string;
  details?: string;
}

export interface ApiRateLimit {
  remaining: number;
  reset: number;
  limit: number;
}