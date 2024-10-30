import React from 'react';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import type { Analysis } from '../types';

interface ResultsListProps {
  results: Analysis[];
}

export default function ResultsList({ results }: ResultsListProps) {
  const getSentimentIcon = (score: number) => {
    if (score > 0) return <ThumbsUp className="w-5 h-5 text-green-500" />;
    if (score < 0) return <ThumbsDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b dark:border-gray-700">
              <th className="p-4">Sentiment</th>
              <th className="p-4">Text</th>
              <th className="p-4">Score</th>
              <th className="p-4">Confidence</th>
              <th className="p-4">Label</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.id} className="border-b dark:border-gray-700">
                <td className="p-4">{getSentimentIcon(result.result.score)}</td>
                <td className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {result.text}
                  </p>
                </td>
                <td className="p-4">
                  <span className="text-sm font-medium">
                    {result.result.score.toFixed(3)}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-sm">
                    {(result.result.confidence * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="p-4">
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    result.result.label === 'POSITIVE'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : result.result.label === 'NEGATIVE'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}>
                    {result.result.label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}