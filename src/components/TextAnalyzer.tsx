import React, { useState } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { huggingFaceService } from '../services/huggingface';
import { sanitizeText } from '../utils/validation';
import type { Analysis } from '../types';

interface TextAnalyzerProps {
  onAnalysis: (result: Analysis) => void;
}

export default function TextAnalyzer({ onAnalysis }: TextAnalyzerProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleAnalysis = async () => {
    const sanitizedText = sanitizeText(text.trim());
    if (!sanitizedText) {
      setError('Please enter valid text');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const result = await huggingFaceService.analyzeSentiment(sanitizedText);
      onAnalysis({
        id: Date.now().toString(),
        text: sanitizedText,
        timestamp: new Date(),
        result,
        source: 'manual'
      });
      setText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-lg font-semibold dark:text-white">Quick Analysis</h2>
      </div>
      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError('');
            }}
            placeholder="Enter text to analyze sentiment..."
            className="w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            maxLength={1000}
          />
          <div className="absolute bottom-4 right-4 flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {text.length}/1000
            </span>
            <button
              onClick={handleAnalysis}
              disabled={loading || !text.trim()}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}