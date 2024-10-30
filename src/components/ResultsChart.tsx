import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartData } from '../types';

interface ResultsChartProps {
  data: ChartData[];
}

export default function ResultsChart({ data }: ResultsChartProps) {
  return (
    <div className="w-full h-[300px] bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="positive" fill="#22c55e" />
          <Bar dataKey="negative" fill="#ef4444" />
          <Bar dataKey="neutral" fill="#94a3b8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}