import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ClipboardList,
  Download,
  Plus,
  RefreshCw,
  FileText,
  Calendar,
  Database,
  CheckCircle,
  Clock,
  Play
} from 'lucide-react';
import PageHeader from './PageHeader';

interface ReportItem {
  id: string;
  name: string;
  size: string;
  format: 'PDF' | 'JSON' | 'CSV';
  generatedAt: string;
  status: 'ready' | 'generating';
}

export default function ReportsView() {
  const [reports, setReports] = useState<ReportItem[]>([
    { id: 'rep-1', name: 'GDPR Ingress Compliance Audit Q3.pdf', size: '2.4 MB', format: 'PDF', generatedAt: '2026-07-13 09:12', status: 'ready' },
    { id: 'rep-2', name: 'High-Dimensional Embeddings Tree Backup.json', size: '18.2 MB', format: 'JSON', generatedAt: '2026-07-12 18:45', status: 'ready' },
    { id: 'rep-3', name: 'Operational Latency Percentiles Log.csv', size: '450 KB', format: 'CSV', generatedAt: '2026-07-10 11:22', status: 'ready' },
    { id: 'rep-4', name: 'Tenant tenant-corp-nexus-01 Configuration.json', size: '120 KB', format: 'JSON', generatedAt: '2026-07-08 16:30', status: 'ready' },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    const newId = `rep-${Date.now()}`;
    const newReport: ReportItem = {
      id: newId,
      name: `Automated Compliance Audit ${new Date().toISOString().slice(0,10)}.pdf`,
      size: 'Calculating...',
      format: 'PDF',
      generatedAt: 'In progress',
      status: 'generating',
    };

    setReports(prev => [newReport, ...prev]);

    setTimeout(() => {
      setReports(prevDocs =>
        prevDocs.map(rep =>
          rep.id === newId
            ? {
                ...rep,
                size: '1.8 MB',
                generatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
                status: 'ready'
              }
            : rep
        )
      );
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enterprise Performance Reports"
        description="Compile audit trail records, export vectorized schemas, and download compliant document telemetry logs on demand."
        action={
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/30 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-md cursor-pointer outline-none"
          >
            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Generate System Audit
          </button>
        }
      />

      {/* Reports workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Configuration details */}
        <div className="lg:col-span-1 space-y-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Report Export Configurations
          </span>

          <div className="p-4 rounded-xl border border-[#1E293B] bg-[#0F1219] space-y-4 shadow-lg shadow-black/20">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-200 block">Automatic Backups</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Automated snapshot backups are saved into the local EU-Dublin database cluster every 24 hours.
              </p>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2 rounded bg-[#0B0E14] border border-[#1E293B]">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">SCHEDULER STATUS</span>
                <span className="text-emerald-500 font-bold uppercase">● ACTIVE</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[#0B0E14] border border-[#1E293B]">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">NEXT SNAPSHOT</span>
                <span className="text-slate-300 font-bold">04:00 UTC</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E293B]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Export Destinations
              </span>
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Secure Local ZIP</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Enterprise Email Mailer</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Available Reports list */}
        <div className="lg:col-span-3 space-y-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Generated Document Registry
          </span>

          <div className="border border-[#1E293B] rounded-xl overflow-hidden bg-[#0F1219] shadow-lg shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0B0E14] border-b border-[#1E293B] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Report Details</th>
                    <th className="py-3 px-4">Format</th>
                    <th className="py-3 px-4">Generated At</th>
                    <th className="py-3 px-4 text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B] font-mono">
                  <AnimatePresence>
                    {reports.map((rep) => (
                      <motion.tr
                        key={rep.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hover:bg-[#13171F] transition-colors"
                      >
                        {/* Name */}
                        <td className="py-3.5 px-4 font-sans font-semibold text-slate-200">
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                            <div className="min-w-0">
                              <p className="truncate max-w-sm md:max-w-md">{rep.name}</p>
                              <span className="text-[10px] text-slate-400 font-mono font-semibold block mt-0.5">{rep.size}</span>
                            </div>
                          </div>
                        </td>

                        {/* Format */}
                        <td className="py-3.5 px-4">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            rep.format === 'PDF' 
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30' 
                              : 'bg-blue-500/10 text-blue-500 border border-blue-500/30'
                          }`}>
                            {rep.format}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          {rep.status === 'generating' ? (
                            <span className="text-blue-500 font-bold flex items-center gap-1">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Compiling...
                            </span>
                          ) : (
                            rep.generatedAt
                          )}
                        </td>

                        {/* Download button */}
                        <td className="py-3.5 px-4 text-right font-sans">
                          <button
                            onClick={() => {
                              alert(`Simulating secure download for report: ${rep.name}`);
                            }}
                            disabled={rep.status === 'generating'}
                            className="p-1.5 rounded-md border border-[#1E293B] bg-[#0B0E14] hover:border-blue-500/40 hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-colors disabled:opacity-40 cursor-pointer outline-none"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
