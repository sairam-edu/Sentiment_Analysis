import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TextAnalyzer from './components/TextAnalyzer';
import FileUploader from './components/FileUploader';
import ResultsChart from './components/ResultsChart';
import ResultsList from './components/ResultsList';
import { Analysis, ChartData } from './types';

function formatDate(date: Date): string {
  try {
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
}

function App() {
  const [darkMode, setDarkMode] = useState(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [results, setResults] = useState<Analysis[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    // Update chart data when results change
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return formatDate(date);
    }).reverse();

    const newChartData = last7Days.map(date => {
      const dayResults = results.filter(r => 
        formatDate(r.timestamp) === date
      );
      
      return {
        name: date,
        positive: dayResults.filter(r => r.result.score > 0).length,
        negative: dayResults.filter(r => r.result.score < 0).length,
        neutral: dayResults.filter(r => r.result.score === 0).length
      };
    });

    setChartData(newChartData);
  }, [results]);

  const handleSingleAnalysis = (analysis: Analysis) => {
    setResults(prev => [analysis, ...prev]);
  };

  const handleBatchAnalysis = (analyses: Analysis[]) => {
    setResults(prev => [...analyses, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <TextAnalyzer onAnalysis={handleSingleAnalysis} />
          <FileUploader onAnalysis={handleBatchAnalysis} />
        </div>

        {results.length > 0 && (
          <>
            <div className="mb-8">
              <ResultsChart data={chartData} />
            </div>
            <ResultsList results={results} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;