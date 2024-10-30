import { describe, it, expect } from 'vitest';
import { validateFile, validateCsvRow, sanitizeText } from '../utils/validation';

describe('File Validation', () => {
  it('should validate CSV file format', () => {
    const validFile = new File([''], 'test.csv', { type: 'text/csv' });
    const invalidFile = new File([''], 'test.txt', { type: 'text/plain' });

    expect(validateFile(validFile)).toBeNull();
    expect(validateFile(invalidFile)?.type).toBe('format');
  });

  it('should validate file size', () => {
    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.csv');
    expect(validateFile(largeFile)?.type).toBe('size');
  });
});

describe('CSV Row Validation', () => {
  it('should validate row structure', () => {
    expect(validateCsvRow({ text: 'Valid text' })).toBeNull();
    expect(validateCsvRow({ wrongField: 'Invalid' })?.type).toBe('structure');
  });

  it('should validate text length', () => {
    const longText = 'a'.repeat(1001);
    expect(validateCsvRow({ text: longText })?.type).toBe('structure');
  });
});

describe('Text Sanitization', () => {
  it('should remove control characters', () => {
    expect(sanitizeText('Hello\x00World')).toBe('HelloWorld');
  });

  it('should remove non-ASCII characters', () => {
    expect(sanitizeText('Hello 👋 World')).toBe('Hello  World');
  });

  it('should trim whitespace', () => {
    expect(sanitizeText('  Hello World  ')).toBe('Hello World');
  });
});