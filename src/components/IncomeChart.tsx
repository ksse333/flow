import React, { useState } from 'react';
import { ChartTimeframe } from '../types';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../lib/calculations';

export const IncomeChart: React.FC = () => {
  const { getChartData, settings } = useData();
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('daily');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const data = getChartData(timeframe);
  const maxAmount = Math.max(...data.map((d) => d.amount), 50);

  const totalPeriodRevenue = data.reduce((sum, d) => sum + d.amount, 0);
  const totalPeriodTransactions = data.reduce((sum, d) => sum + d.count, 0);

  const timeframes: { key: ChartTimeframe; label: string }[] = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly', label: 'Yearly' },
  ];

  return (
    <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Income Overview</h3>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-mono-numbers text-slate-500">
              Total {formatCurrency(totalPeriodRevenue, settings.currency)} ({totalPeriodTransactions} sales)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Revenue trends calculated automatically from verified transactions
          </p>
        </div>

        {/* Timeframe Segmented Control (Button Tabs allowed per Zero-Pill Constitution) */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          {timeframes.map((tf) => (
            <button
              key={tf.key}
              type="button"
              onClick={() => {
                setTimeframe(tf.key);
                setHoveredIdx(null);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                timeframe === tf.key
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Bar Chart */}
      <div className="relative h-64 w-full flex items-end pt-8 pb-6">
        {/* Horizontal Guide Lines */}
        <div className="absolute inset-x-0 inset-y-8 flex flex-col justify-between pointer-events-none opacity-40">
          <div className="border-b border-dashed border-slate-200 w-full" />
          <div className="border-b border-dashed border-slate-200 w-full" />
          <div className="border-b border-dashed border-slate-200 w-full" />
          <div className="border-b border-slate-200 w-full" />
        </div>

        {/* Bars Container */}
        <div className="relative w-full h-full flex items-end justify-between gap-2 z-10 px-2">
          {data.map((item, idx) => {
            const heightPercent = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              >
                {/* Floating Tooltip */}
                {isHovered && (
                  <div className="absolute -top-12 z-30 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] rounded-md shadow-lg pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95">
                    <div className="font-semibold">{item.label}</div>
                    <div className="font-mono-numbers text-emerald-300">
                      {formatCurrency(item.amount, settings.currency)} · {item.count} orders
                    </div>
                  </div>
                )}

                {/* Amount label on hover or top */}
                <div
                  className={`text-[10px] font-mono-numbers text-slate-500 mb-1 transition-opacity ${
                    isHovered || data.length <= 7 ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'
                  }`}
                >
                  {item.amount > 0 ? `${item.amount}` : ''}
                </div>

                {/* Visual Bar */}
                <div className="w-full max-w-[42px] bg-slate-100 rounded-t-md relative flex items-end overflow-hidden h-full">
                  <div
                    style={{ height: `${Math.max(item.amount > 0 ? 6 : 0, heightPercent)}%` }}
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      isHovered
                        ? 'bg-slate-900'
                        : 'bg-slate-800/85 hover:bg-slate-900'
                    }`}
                  />
                </div>

                {/* X-Axis Label */}
                <div className="text-[11px] font-medium text-slate-500 mt-2 truncate max-w-full text-center">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
