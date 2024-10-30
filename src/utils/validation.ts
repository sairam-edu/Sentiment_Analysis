import { z } from 'zod';
import { ValidationError } from '../types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TEXT_LENGTH = 1000;

export const csvSchema = z.object({
  text: z.string().min(1).max(MAX_TEXT_LENGTH),
});

export function validateFile(file: File): ValidationError | null {
  if (!file.name.endsWith('.csv')) {
    return {
      type: 'format',
      message: 'Invalid file format',
      details: 'Please upload a CSV file',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      type: 'size',
      message: 'File too large',
      details: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return null;
}

export function validateCsvRow(row: unknown): ValidationError | null {
  try {
    csvSchema.parse(row);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        type: 'structure',
        message: 'Invalid row structure',
        details: error.errors[0].message,
      };
    }
    return {
      type: 'content',
      message: 'Invalid content',
      details: 'Row validation failed',
    };
  }
}

export function sanitizeText(text: string): string {
  return text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
    .trim();
}