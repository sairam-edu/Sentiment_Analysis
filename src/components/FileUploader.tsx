import React, { useRef, useState } from 'react';
import { Upload, AlertCircle, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { huggingFaceService } from '../services/huggingface';
import { validateFile, validateCsvRow, sanitizeText } from '../utils/validation';
import type { Analysis, ValidationError } from '../types';

interface FileUploaderProps {
  onAnalysis: (results: Analysis[]) => void;
}

export default function FileUploader({ onAnalysis }: FileUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ValidationError | null>(null);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileError = validateFile(file);
    if (fileError) {
      setError(fileError);
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    const rows: { text: string }[] = [];
    let totalRows = 0;
    let processedRows = 0;

    Papa.parse(file, {
      header: true,
      step: (results) => {
        const rowError = validateCsvRow(results.data);
        if (!rowError) {
          const sanitizedText = sanitizeText(results.data.text as string);
          if (sanitizedText) {
            rows.push({ text: sanitizedText });
          }
        }
        totalRows++;
        processedRows++;
        setProgress(Math.round((processedRows / totalRows) * 100));
      },
      complete: async () => {
        try {
          if (rows.length === 0) {
            setError({
              type: 'content',
              message: 'No valid data found',
              details: 'File contains no valid text entries',
            });
            return;
          }

          const texts = rows.map(row => row.text);
          const sentiments = await huggingFaceService.analyzeBatch(texts);

          const analyses: Analysis[] = sentiments.map((sentiment, index) => ({
            id: Date.now().toString() + index,
            text: texts[index],
            timestamp: new Date(),
            result: sentiment,
            source: 'csv',
          }));

          onAnalysis(analyses);
          if (fileRef.current) fileRef.current.value = '';
        } catch (err) {
          setError({
            type: 'api',
            message: 'Analysis failed',
            details: err instanceof Error ? err.message : 'Unknown error occurred',
          });
        } finally {
          setLoading(false);
          setProgress(0);
        }
      },
      error: (error) => {
        setError({
          type: 'format',
          message: 'Failed to read file',
          details: error.message,
        });
        setLoading(false);
      },
    });
  };

  return (
    <div className="w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-lg font-semibold dark:text-white">Batch Analysis</h2>
      </div>
      
      <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={loading}
        />
        <div className="space-y-2">
          {loading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Processing... {progress}%
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <Upload className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Drop your CSV file here or click to upload
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                File should contain a 'text' column (max 5MB)
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{error.message}</span>
          </div>
          {error.details && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {error.details}
            </p>
          )}
        </div>
      )}
    </div>
  );
}