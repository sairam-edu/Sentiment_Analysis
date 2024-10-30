import React from 'react';
import { FallbackProps } from 'react-error-boundary';
import { AlertOctagon } from 'lucide-react';

export default function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="p-6 bg-red-50 dark:bg-red-900/30 rounded-lg">
      <div className="flex items-center space-x-3 mb-4">
        <AlertOctagon className="w-6 h-6 text-red-600 dark:text-red-400" />
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">
          Something went wrong
        </h3>
      </div>
      <p className="text-sm text-red-600 dark:text-red-300 mb-4">
        {error.message}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}