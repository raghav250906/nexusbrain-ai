import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Network,
  Bot,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  TrendingUp,
  Cpu,
  Clock,
  RefreshCw,
  Plus,
  Compass
} from 'lucide-react';
import PageHeader from './PageHeader';

interface DashboardViewProps {
  onNavigate: (view: any) => void;
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const [metrics, setMetrics] = useState({
    docsCount: 412,
    nodesCount: 5820,
    copilotQueries: 12402,
    healthIndex: 99.8,
  });

  const [activeTab, setActiveTab] = useState<'all' | 'ai' | 'system'>('all');

  // Simple real-time update simulator for active system statistics
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        nodesCount: prev.nodesCount + (Math.random() > 0.6 ? 1 : 0),
        copilotQueries: prev.copilotQueries + (Math.random() > 0.7 ? 1 : 0),
        healthIndex: Number((99.5 + Math.random() * 0.4).toFixed(2)),
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const kpis = [
    {
      id: 'documents',
      title: 'Active Agents',
      value: metrics.docsCount,
      unit: 'Running Workers',
      change: '+12.5%',
      isPositive: true,
      icon: <FileText className="w-4 h-4 text-blue-500" />,
      color: 'blue',
    },
    {
      id: 'knowledge-graph',
      title: 'Graph Density',
      value: '89.4%',
      unit: 'Active Vertices',
      change: '+3.2%',
      isPositive: true,
      icon: <Network className="w-4 h-4 text-purple-500" />,
      color: 'purple',
    },
    {
      id: 'ai-copilot',
      title: 'Avg Response Time',
      value: '240ms',
      unit: 'Queries Resolved',
      change: 'Stable',
      isPositive: true,
      icon: <Bot className="w-4 h-4 text-emerald-500" />,
      color: 'emerald',
    },
    {
      id: 'maintenance',
      title: 'System Health',
      value: `${metrics.healthIndex}%`,
      unit: 'Cluster Efficiency',
      change: '-2 Nodes',
      isPositive: false,
      icon: <Activity className="w-4 h-4 text-amber-500" />,
      color: 'amber',
    },
  ];

  const recentEvents = [
    { id: 'ev-1', type: 'ai', title: 'Knowledge Sync Success', desc: 'Synthesized 12 nodes from Q3 Financials.pdf', time: 'Cluster US-East-1 • 2m ago', status: 'success' },
    { id: 'ev-2', type: 'system', title: 'Agent Performance Dip', desc: 'Vector indexing bottleneck detected on node-h4', time: 'Region EU-Central-1 • 14m ago', status: 'warning' },
    { id: 'ev-3', type: 'system', title: 'Security Audit Initiated', desc: 'Compliance scanner run on schema residency', time: 'Global Compliance • 1h ago', status: 'info' },
    { id: 'ev-4', type: 'ai', title: 'New Node Provisioned', desc: 'Successfully integrated with Kubernetes backend', time: 'Infrastructure Stack • 3h ago', status: 'success' },
    { id: 'ev-5', type: 'system', title: 'Backup Schema Sync', desc: 'Automated DB configuration saved securely', time: 'Database Replica • 5h ago', status: 'success' },
  ];

  const filteredEvents = activeTab === 'all' 
    ? recentEvents 
    : recentEvents.filter(ev => ev.type === activeTab);

  const chartBars = [
    { val: '40%', type: 'processed' },
    { val: '60%', type: 'ingested' },
    { val: '35%', type: 'processed' },
    { val: '75%', type: 'ingested' },
    { val: '50%', type: 'processed' },
    { val: '90%', type: 'ingested' },
    { val: '45%', type: 'processed' },
    { val: '70%', type: 'ingested' },
    { val: '55%', type: 'processed' },
    { val: '85%', type: 'ingested' },
    { val: '40%', type: 'processed' },
    { val: '65%', type: 'ingested' },
    { val: '30%', type: 'processed' },
    { val: '75%', type: 'ingested' },
    { val: '45%', type: 'processed' },
    { val: '95%', type: 'ingested' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Nexus Intelligence Overview"
        description="Monitoring AI operations and compliance across 14 clusters."
        action={
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setMetrics(prev => ({
                  ...prev,
                  docsCount: prev.docsCount + 1,
                  nodesCount: prev.nodesCount + 15
                }));
              }}
              className="px-4 py-2 bg-[#0F1219] border border-[#1E293B] rounded-md text-sm font-medium hover:bg-slate-800 text-slate-300 transition-colors flex items-center gap-2 outline-none"
            >
              <RefreshCw className="w-4 h-4" />
              Force Poll
            </button>
            <button 
              onClick={() => onNavigate('documents')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 outline-none shadow-lg shadow-blue-500/10"
            >
              <Plus className="w-4 h-4" />
              New Knowledge Source
            </button>
          </div>
        }
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            onClick={() => onNavigate(kpi.id)}
            className="bg-[#0F1219] p-5 rounded-xl border border-[#1E293B] flex flex-col gap-3 shadow-lg shadow-black/20 hover:border-slate-700 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-lg ${
                kpi.id === 'documents' ? 'bg-blue-500/10 text-blue-500' :
                kpi.id === 'knowledge-graph' ? 'bg-purple-500/10 text-purple-500' :
                kpi.id === 'ai-copilot' ? 'bg-emerald-500/10 text-emerald-500' :
                'bg-amber-500/10 text-amber-500'
              }`}>
                {kpi.icon}
              </div>
              <span className={`text-xs font-bold ${
                kpi.isPositive ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {kpi.change}
              </span>
            </div>
            
            <div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">{kpi.title}</div>
              <div className="text-2xl font-bold text-white mt-1 font-sans tracking-tight">{kpi.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: System Telemetry & Event Ingress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Engine Metrics Visualization */}
        <div className="lg:col-span-2 bg-[#0F1219] border border-[#1E293B] rounded-xl overflow-hidden flex flex-col shadow-lg shadow-black/20">
          <div className="p-4 border-b border-[#1E293B] flex justify-between items-center bg-[#13171F]">
            <span className="text-sm font-bold text-white">Intelligence Throughput</span>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Ingested</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Processed</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-6 flex flex-col justify-end bg-[#0F1219]">
            <div className="flex items-end justify-between h-40 gap-1.5 md:gap-2.5">
              {chartBars.map((bar, i) => (
                <div 
                  key={i} 
                  className="w-full rounded-t-sm transition-all duration-300 hover:brightness-125 cursor-pointer relative group/bar"
                  style={{ height: bar.val }}
                >
                  <div className={`w-full h-full rounded-t-sm ${
                    bar.type === 'ingested' ? 'bg-blue-500' : 'bg-slate-700'
                  }`} />
                  {/* Tooltip on hover */}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/bar:block bg-[#0B0E14] text-white border border-[#1E293B] text-[9px] px-1.5 py-0.5 rounded shadow-xl whitespace-nowrap z-10 font-mono">
                    {bar.type === 'ingested' ? 'Ingested' : 'Processed'}: {bar.val}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-[#1E293B] flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>Mon 01</span>
              <span>Tue 02</span>
              <span>Wed 03</span>
              <span>Thu 04</span>
              <span>Fri 05</span>
              <span>Sat 06</span>
              <span>Sun 07</span>
            </div>
          </div>

          {/* Quick Metrics Dials */}
          <div className="grid grid-cols-3 gap-3 p-6 bg-[#0F1219] border-t border-[#1E293B]">
            <div className="p-3 bg-[#0B0E14] border border-[#1E293B] rounded-lg text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Uptime Ratio</span>
              <p className="text-sm font-semibold text-blue-500 font-mono mt-0.5">99.997%</p>
            </div>
            <div className="p-3 bg-[#0B0E14] border border-[#1E293B] rounded-lg text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Indexing Delay</span>
              <p className="text-sm font-semibold text-emerald-400 font-mono mt-0.5">42ms</p>
            </div>
            <div className="p-3 bg-[#0B0E14] border border-[#1E293B] rounded-lg text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Network Ingress</span>
              <p className="text-sm font-semibold text-purple-400 font-mono mt-0.5">142.2 MB/s</p>
            </div>
          </div>

          {/* Quick Actions Drawer */}
          <div className="p-6 bg-[#13171F]/20 border-t border-[#1E293B]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
              Rapid Cluster Operations
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button onClick={() => onNavigate('knowledge-graph')} className="py-2 px-3 rounded-lg bg-[#0F1219] hover:bg-slate-800 border border-[#1E293B] hover:border-slate-600 text-xs text-slate-300 hover:text-white text-left transition-all font-medium flex items-center justify-between outline-none">
                <span>Synthesize Nodes</span>
                <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              </button>
              <button onClick={() => onNavigate('compliance')} className="py-2 px-3 rounded-lg bg-[#0F1219] hover:bg-slate-800 border border-[#1E293B] hover:border-slate-600 text-xs text-slate-300 hover:text-white text-left transition-all font-medium flex items-center justify-between outline-none">
                <span>Policy Scanner</span>
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
              </button>
              <button onClick={() => onNavigate('maintenance')} className="py-2 px-3 rounded-lg bg-[#0F1219] hover:bg-slate-800 border border-[#1E293B] hover:border-slate-600 text-xs text-slate-300 hover:text-white text-left transition-all font-medium flex items-center justify-between outline-none">
                <span>Purge Cache</span>
                <Activity className="w-3.5 h-3.5 text-rose-500" />
              </button>
              <button onClick={() => onNavigate('settings')} className="py-2 px-3 rounded-lg bg-[#0F1219] hover:bg-slate-800 border border-[#1E293B] hover:border-slate-600 text-xs text-slate-300 hover:text-white text-left transition-all font-medium flex items-center justify-between outline-none">
                <span>Configure Keys</span>
                <Plus className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Ingress Event Stream */}
        <div className="bg-[#0F1219] border border-[#1E293B] rounded-xl overflow-hidden flex flex-col shadow-lg shadow-black/20 h-[450px] lg:h-auto">
          <div className="p-4 border-b border-[#1E293B] bg-[#13171F] flex justify-between items-center">
            <span className="text-sm font-bold text-white">System Logs</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="p-4 flex-1 flex flex-col overflow-hidden">
            {/* Activity Category Filters */}
            <div className="flex gap-1.5 mb-4 bg-[#0B0E14] border border-[#1E293B] p-1 rounded-lg shrink-0">
              {['all', 'ai', 'system'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors outline-none cursor-pointer ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Log List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              {filteredEvents.map((ev) => (
                <div key={ev.id} className="flex gap-3 group/item">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                    ev.type === 'ai' ? 'bg-purple-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <div className="text-[11px] font-bold text-white uppercase tracking-tight">
                      {ev.title}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{ev.time}</div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">{ev.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-[#1E293B] bg-[#13171F]/20">
            <button 
              onClick={() => onNavigate('compliance')} 
              className="w-full py-2 text-xs font-bold text-slate-400 hover:text-white border border-[#1E293B] rounded-md transition-colors uppercase tracking-wider outline-none"
            >
              VIEW ALL LOGS
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
