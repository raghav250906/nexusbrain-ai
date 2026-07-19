import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  TrendingUp,
  Coins,
  Cpu,
  Clock,
  ArrowUpRight,
  Filter,
  Calendar,
  Sparkles,
  Zap
} from 'lucide-react';
import PageHeader from './PageHeader';

export default function AnalyticsView() {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('7d');
  const [hoveredData, setHoveredData] = useState<string | null>(null);

  // Hardcoded telemetry stats
  const metrics = [
    { label: 'Avg Latency Profile', value: '18.4ms', change: '-4.2%', isPositive: true, detail: 'p95 percentile' },
    { label: 'Token Throughput', value: '1,420 t/s', change: '+22.8%', isPositive: true, detail: 'Concurrency peak' },
    { label: 'Compute Credits', value: '$242.05', change: '+14.5%', isPositive: false, detail: 'Current billing period' },
    { label: 'Caching Efficiency', value: '94.2%', change: '+1.4%', isPositive: true, detail: 'Query hits' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Telemetry & Cost Metrics"
        description="Audit response times, monitor compute credit exhaustion rates, and explore high-dimensional semantic indexing benchmarks."
        action={
          <div className="flex bg-[#0B0E14] border border-[#1E293B] p-1 rounded-lg">
            {(['24h', '7d', '30d'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer outline-none ${
                  timeframe === t
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="p-5 rounded-xl border border-[#1E293B] bg-[#0F1219] hover:border-slate-500 transition-all shadow-lg shadow-black/20"
          >
            <span className="text-[10px] text-slate-500 font-mono font-bold block uppercase tracking-wider">{m.label}</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl md:text-2xl font-bold font-sans text-white">{m.value}</span>
              <span className={`text-[10px] font-mono font-bold ${m.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {m.change}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-[#1E293B] flex justify-between items-center">
              <span>{m.detail}</span>
              <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main interactive charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Latency peaks */}
        <div className="p-5 rounded-xl border border-[#1E293B] bg-[#0F1219] space-y-4 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#1E293B]">
            <div className="flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-blue-500" />
              <span className="text-sm font-semibold text-slate-200">Operation Response Times (Percentiles)</span>
            </div>
            <span className="text-[9px] font-mono bg-[#0B0E14] px-1.5 py-0.5 rounded border border-[#1E293B] text-slate-400 font-bold">
              MILLISECONDS
            </span>
          </div>

          {/* SVG representation of latency curve */}
          <div className="h-56 bg-[#0B0E14] rounded-lg p-3 border border-[#1E293B] relative overflow-hidden flex items-end">
            {/* Grid Lines */}
            <div className="absolute inset-0 grid grid-rows-4 pointer-events-none px-3 py-4">
              {[80, 60, 40, 20].map((v) => (
                <div key={v} className="border-t border-[#1E293B] w-full flex justify-between">
                  <span className="text-[8px] text-slate-500 font-mono mt-1 font-bold">{v}ms</span>
                </div>
              ))}
            </div>

            {/* SVG line */}
            <svg className="w-full h-40 absolute inset-0 text-blue-500" viewBox="0 0 500 150" preserveAspectRatio="none">
              <path
                d="M 0 130 C 50 120, 100 40, 150 90 C 200 140, 250 50, 300 20 C 350 10, 400 110, 450 70 L 500 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M 0 140 C 50 130, 100 80, 150 110 C 200 140, 250 90, 300 60 C 350 50, 400 130, 450 100 L 500 90"
                fill="none"
                stroke="#A855F7"
                strokeWidth="1.5"
                strokeDasharray="4"
              />
            </svg>

            {/* Hover tooltip point mock */}
            <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-[#0F1219] border border-[#1E293B] p-2.5 rounded shadow-2xl shadow-black text-[10px] font-mono">
              <p className="text-slate-400 uppercase tracking-wider text-[9px] font-bold">COGNITIVE SEARCH QUERY</p>
              <p className="text-white font-bold mt-0.5">p95 Latency: <span className="text-blue-500">42ms</span></p>
            </div>
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>00:00 UTC</span>
            <div className="flex gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-blue-500" /> p95 peaks
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 border-t border-dashed border-purple-500" /> p50 standard
              </span>
            </div>
            <span>Current Month</span>
          </div>
        </div>

        {/* Chart 2: Cost breakdowns */}
        <div className="p-5 rounded-xl border border-[#1E293B] bg-[#0F1219] space-y-4 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#1E293B]">
            <div className="flex items-center gap-2">
              <Coins className="w-4.5 h-4.5 text-blue-500" />
              <span className="text-sm font-semibold text-slate-200">AI Ingress Cost Demarcation ($)</span>
            </div>
            <span className="text-[9px] font-mono bg-[#0B0E14] px-1.5 py-0.5 rounded border border-[#1E293B] text-slate-400 font-bold">
              ACCUMULATED
            </span>
          </div>

          {/* SVG bar representation */}
          <div className="h-56 bg-[#0B0E14] rounded-lg p-4 border border-[#1E293B] flex items-end justify-between gap-3 relative">
            <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-rose-500/30 z-10">
              <span className="text-[8px] text-rose-500 font-mono bg-[#0B0E14] px-1.5 absolute left-2 -top-1.5 border border-rose-500/30 rounded font-bold">
                WARNING THRESHOLD ($300)
              </span>
            </div>

            {[
              { label: 'Q1', val: 120, col: 'bg-blue-600' },
              { label: 'Q2', val: 180, col: 'bg-blue-500' },
              { label: 'Q3', val: 242, col: 'bg-blue-400 shadow-lg shadow-blue-500/20' },
              { label: 'Q4 (Est)', val: 290, col: 'bg-slate-800' }
            ].map(b => (
              <div key={b.label} className="flex-1 flex flex-col items-center gap-2 z-15">
                <div className="w-full bg-[#0F1219] border border-[#1E293B] rounded-t-md overflow-hidden relative" style={{ height: '140px' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(b.val / 350) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`w-full absolute bottom-0 rounded-t ${b.col}`}
                  />
                </div>
                <div className="text-center font-mono">
                  <span className="text-[10px] text-slate-200 font-bold block">${b.val}</span>
                  <span className="text-[9px] text-slate-500 font-bold block uppercase mt-0.5">{b.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 p-3 bg-[#0B0E14] rounded-lg text-[10px] text-slate-400 leading-relaxed border border-[#1E293B]">
            <Zap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span>
              Billing estimates are processed asynchronously every 2 hours. Enterprise quota allowances resets automatically on the 1st of each calendar month.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
