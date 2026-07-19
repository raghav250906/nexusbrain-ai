import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Wrench,
  Activity,
  Cpu,
  RefreshCw,
  HardDrive,
  Trash2,
  List,
  CheckCircle,
  AlertTriangle,
  Play
} from 'lucide-react';
import PageHeader from './PageHeader';

interface LogItem {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export default function MaintenanceView() {
  const [cacheSize, setCacheSize] = useState(242.4);
  const [latency, setLatency] = useState(14);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([
    { timestamp: '11:04:02', level: 'info', message: 'NexusBrain engine boot completed (v2.4.0-PRO).' },
    { timestamp: '11:04:05', level: 'info', message: 'Successfully bind to interface 0.0.0.0:3000.' },
    { timestamp: '11:04:10', level: 'info', message: 'Memory Corpus Synced. Count: 5. Tokens: 2,442,350.' },
    { timestamp: '11:04:15', level: 'info', message: 'Cron scheduler loaded: 3 recurring indexes active.' },
    { timestamp: '11:04:22', level: 'info', message: 'Compliance residency policies checked: Schengen Area Zone approved.' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Add a random log occasionally
      const r = Math.random();
      const now = new Date().toTimeString().split(' ')[0];
      let newLog: LogItem;

      if (r > 0.85) {
        newLog = { timestamp: now, level: 'warn', message: 'Data ingestion queue length peak: 14 documents.' };
      } else if (r > 0.7) {
        newLog = { timestamp: now, level: 'info', message: 'Index rebalancing force factor synchronized: nominal.' };
      } else {
        newLog = { timestamp: now, level: 'info', message: `Database cache hit ratio standard: ${(94 + Math.random() * 5).toFixed(1)}%.` };
      }

      setLogs(prev => [newLog, ...prev].slice(0, 30));
      setLatency(Math.floor(Math.random() * 6) + 11);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleOptimize = () => {
    setIsOptimizing(true);
    const now = new Date().toTimeString().split(' ')[0];
    setLogs(prev => [
      { timestamp: now, level: 'info', message: 'Executing index vector rebalance...' },
      ...prev
    ]);

    setTimeout(() => {
      setIsOptimizing(false);
      const doneTime = new Date().toTimeString().split(' ')[0];
      setLogs(prev => [
        { timestamp: doneTime, level: 'info', message: 'Index optimization completed. Freed 12,042 dead nodes.' },
        ...prev
      ]);
    }, 3000);
  };

  const handlePurge = () => {
    setIsPurging(true);
    const now = new Date().toTimeString().split(' ')[0];
    setLogs(prev => [
      { timestamp: now, level: 'warn', message: 'Purging database query cache buffers...' },
      ...prev
    ]);

    setTimeout(() => {
      setIsPurging(false);
      setCacheSize(1.2);
      const doneTime = new Date().toTimeString().split(' ')[0];
      setLogs(prev => [
        { timestamp: doneTime, level: 'info', message: 'Cache purge completed. Ingestion indexes re-compiled.' },
        ...prev
      ]);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Engine Operations & Health"
        description="Monitor low-level engine parameters, execute re-indexing sequences, and inspect database activity logs."
      />

      {/* System Status Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[#1E293B] bg-[#0F1219] shadow-lg shadow-black/20">
          <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="font-bold uppercase tracking-wider text-[10px]">Operational Latency</span>
          </div>
          <p className="text-xl font-bold font-mono text-white">{latency} ms</p>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 mt-2 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold uppercase">Nominal threshold</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#1E293B] bg-[#0F1219] shadow-lg shadow-black/20">
          <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
            <HardDrive className="w-4 h-4 text-blue-500" />
            <span className="font-bold uppercase tracking-wider text-[10px]">Allocated Cache</span>
          </div>
          <p className="text-xl font-bold font-mono text-white">{cacheSize.toFixed(1)} MB</p>
          <span className="text-[10px] text-slate-400 mt-2 block font-medium">Buffered vector schemas</span>
        </div>

        <div className="p-4 rounded-xl border border-[#1E293B] bg-[#0F1219] shadow-lg shadow-black/20">
          <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
            <Cpu className="w-4 h-4 text-purple-500" />
            <span className="font-bold uppercase tracking-wider text-[10px]">Garbage Collection</span>
          </div>
          <p className="text-xl font-bold font-mono text-white">Every 15m</p>
          <span className="text-[10px] text-blue-500 font-mono mt-2 block font-bold uppercase tracking-wider">Active automatic task</span>
        </div>

        <div className="p-4 rounded-xl border border-[#1E293B] bg-[#0F1219] shadow-lg shadow-black/20">
          <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
            <Wrench className="w-4 h-4 text-cyan-500" />
            <span className="font-bold uppercase tracking-wider text-[10px]">Database Engine</span>
          </div>
          <p className="text-xl font-bold text-white">v2.4.0-PRO</p>
          <span className="text-[10px] text-slate-400 mt-2 block font-medium">Secure Enterprise Tenant</span>
        </div>
      </div>

      {/* Action panel & live logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Operations */}
        <div className="lg:col-span-1 p-5 rounded-xl border border-[#1E293B] bg-[#0F1219] space-y-4 shadow-lg shadow-black/20">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Core Maintenance Directives
          </span>

          <div className="space-y-3">
            {/* Optimize indices */}
            <div className="p-3.5 bg-[#0B0E14] border border-[#1E293B] rounded-lg space-y-2.5">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Optimizer Routine</span>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                  Defragments and balances high-dimensional vector clusters in the database index tree.
                </p>
              </div>
              <button
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="w-full h-8 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/30 text-xs font-bold uppercase tracking-wider text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer outline-none"
              >
                {isOptimizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                {isOptimizing ? 'Rebalancing...' : 'Execute Index Rebalance'}
              </button>
            </div>

            {/* Cache purge */}
            <div className="p-3.5 bg-[#0B0E14] border border-[#1E293B] rounded-lg space-y-2.5">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Purge Cache Buffers</span>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                  Purges stored search query answers to force complete fresh vector calculations.
                </p>
              </div>
              <button
                onClick={handlePurge}
                disabled={isPurging}
                className="w-full h-8 rounded border border-[#1E293B] hover:border-rose-500/30 bg-[#0B0E14] hover:bg-rose-500/10 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-rose-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer outline-none"
              >
                {isPurging ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" /> : <Trash2 className="w-3.5 h-3.5" />}
                {isPurging ? 'Purging Cache...' : 'Flush Cache Pools'}
              </button>
            </div>
          </div>
        </div>

        {/* Live Logs console */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-[#1E293B] bg-[#0F1219] flex flex-col h-[350px] shadow-lg shadow-black/20">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-4">
            <div className="flex items-center gap-2">
              <List className="w-4.5 h-4.5 text-blue-500" />
              <h3 className="text-sm font-semibold text-slate-200">Database Engine Logging Console</h3>
            </div>
            <span className="text-[9px] font-mono bg-[#0B0E14] px-1.5 py-0.5 rounded border border-[#1E293B] text-slate-400 font-bold">
              STD_OUT ENABLED
            </span>
          </div>

          {/* Console */}
          <div className="flex-1 bg-[#0B0E14] border border-[#1E293B] p-3.5 rounded-lg font-mono text-[11px] overflow-y-auto space-y-1.5 scrollbar-thin">
            {logs.map((log, idx) => {
              let color = 'text-slate-300';
              if (log.level === 'warn') color = 'text-amber-500';
              if (log.level === 'error') color = 'text-rose-500';
              return (
                <div key={idx} className="flex gap-2.5 items-start leading-relaxed">
                  <span className="text-slate-500 select-none">{log.timestamp}</span>
                  <span className={`text-[10px] font-bold select-none ${
                    log.level === 'warn' ? 'text-amber-500 font-bold' : 'text-blue-500 font-bold'
                  }`}>
                    [{log.level.toUpperCase()}]
                  </span>
                  <span className={color}>{log.message}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
