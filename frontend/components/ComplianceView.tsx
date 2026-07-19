import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Globe,
  Sliders,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  Info,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import PageHeader from './PageHeader';
import { AuditLogItem } from '../types';

export default function ComplianceView() {
  const [region, setRegion] = useState('EU-Dublin');
  const [safetyLevel, setSafetyLevel] = useState(85);
  const [audits, setAudits] = useState<AuditLogItem[]>([
    { id: 'aud-1', timestamp: '11:02:40', user: 'Super Admin', action: 'Data residency checked', category: 'security', status: 'passed' },
    { id: 'aud-2', timestamp: '10:55:12', user: 'Auto Auditor', action: 'Vector chunk PII scan', category: 'data', status: 'passed' },
    { id: 'aud-3', timestamp: '09:12:00', user: 'Compliance Auditor', action: 'Tenant tenant-corp-nexus-01 created', category: 'access', status: 'passed' },
    { id: 'aud-4', timestamp: '08:32:15', user: 'System Sentinel', action: 'Outbound prompt safety threshold violation', category: 'security', status: 'warning' },
    { id: 'aud-5', timestamp: '05:40:00', user: 'Auto Auditor', action: 'EU Privacy Sandbox encryption audit', category: 'system', status: 'passed' },
  ]);

  const [guidelines, setGuidelines] = useState([
    { id: 'gdpr', name: 'GDPR (Data Privacy Shield)', checked: true, desc: 'Enforces strict customer data rights, PII filtering, and automated deletion clauses.' },
    { id: 'hipaa', name: 'HIPAA Health Compliance', checked: false, desc: 'Restricts health record analysis to secure medical tenant isolation spaces.' },
    { id: 'fedramp', name: 'FedRAMP Security Baseline', checked: true, desc: 'Ensures data storage is encrypted using FIPS 140-2 validated encryption keys.' },
    { id: 'ccpa', name: 'CCPA California Guidelines', checked: true, desc: 'Provides California consumers control over opt-out mechanisms for AI processing.' },
  ]);

  const handleToggleGuideline = (id: string) => {
    setGuidelines(prev => prev.map(g => {
      if (g.id === id) {
        const nextState = !g.checked;
        // add audit log entry
        const now = new Date().toTimeString().split(' ')[0];
        const newLog: AuditLogItem = {
          id: `aud-${Date.now()}`,
          timestamp: now,
          user: 'Super Admin',
          action: `${g.name} compliance policy ${nextState ? 'enabled' : 'disabled'}`,
          category: 'security',
          status: 'passed'
        };
        setAudits(prevLogs => [newLog, ...prevLogs]);
        return { ...g, checked: nextState };
      }
      return g;
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance & Safety Audits"
        description="Enforce automated governance parameters over AI responses. Configure storage zones, toggle regulatory benchmarks, and audit access coordinates."
      />

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Storage Region & Safety Guardrails */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Data residency region */}
          <div className="p-5 rounded-xl border border-[#1E293B] bg-[#0F1219] space-y-4 shadow-lg shadow-black/20">
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#1E293B]">
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider text-[10px]">Regional Data Sovereignty</span>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-400 leading-relaxed">
                Choose the physical cloud coordinates where your vector data is stored and calculated.
              </p>
              
              <div className="space-y-1.5 pt-1.5">
                {[
                  { id: 'EU-Dublin', label: 'EU Central (Dublin, Ireland)', icon: '🇪🇺' },
                  { id: 'US-East', label: 'US East Coast (N. Virginia)', icon: '🇺🇸' },
                  { id: 'APAC-Singapore', label: 'APAC South (Singapore)', icon: '🇸🇬' }
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRegion(r.id);
                      const now = new Date().toTimeString().split(' ')[0];
                      setAudits(prev => [{
                        id: `aud-${Date.now()}`,
                        timestamp: now,
                        user: 'Super Admin',
                        action: `Storage zone migrated to ${r.id}`,
                        category: 'data',
                        status: 'passed'
                      }, ...prev]);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer outline-none ${
                      region === r.id
                        ? 'bg-blue-600/10 border-blue-500/40 text-white font-bold'
                        : 'bg-[#0B0E14] border-transparent hover:bg-[#13171F] hover:border-[#1E293B] text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="font-semibold flex items-center gap-2 text-xs">
                      <span className="text-base select-none">{r.icon}</span>
                      <span>{r.label}</span>
                    </span>
                    {region === r.id && <CheckCircle className="w-4 h-4 text-blue-500" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Model Safety threshold slider */}
          <div className="p-5 rounded-xl border border-[#1E293B] bg-[#0F1219] space-y-4 shadow-lg shadow-black/20">
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#1E293B]">
              <Sliders className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider text-[10px]">Hallucination & PII Filtering</span>
            </div>

            <div className="space-y-3.5">
              <div className="flex justify-between items-baseline font-mono text-xs text-slate-400">
                <span className="font-bold">FILTER RIGIDITY</span>
                <span className="text-blue-500 font-bold">{safetyLevel}% Compliance</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={safetyLevel}
                onChange={(e) => setSafetyLevel(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex gap-2 p-2.5 bg-[#0B0E14] rounded-lg text-[10px] text-slate-400 leading-relaxed border border-[#1E293B]">
                <ShieldAlert className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  Rigidity above 85% automatically enforces triple vector check passes, reducing response speeds by approximately 15ms.
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Middle Column: Compliance Guidelines Checklist */}
        <div className="lg:col-span-1 p-5 rounded-xl border border-[#1E293B] bg-[#0F1219] space-y-4 h-fit shadow-lg shadow-black/20">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#1E293B]">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider text-[10px]">Regulatory Frameworks</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Verify automated system guardrails corresponding to compliance benchmarks inside active corporate directories.
          </p>

          <div className="space-y-3 pt-1.5">
            {guidelines.map(g => (
              <div
                key={g.id}
                onClick={() => handleToggleGuideline(g.id)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  g.checked
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-[#0B0E14] border-[#1E293B] hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-semibold ${g.checked ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {g.name}
                  </span>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    g.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-[#1E293B]'
                  }`}>
                    {g.checked && (
                      <svg className="w-3 h-3 stroke-current stroke-3 fill-none" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Real-time Compliance Audit Trail */}
        <div className="lg:col-span-1 p-5 rounded-xl border border-[#1E293B] bg-[#0F1219] flex flex-col h-[400px] lg:h-auto shadow-lg shadow-black/20">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-blue-500" />
              <h3 className="text-sm font-semibold text-slate-200">Immutable Audit Trail</h3>
            </div>
            <span className="text-[9px] font-mono text-slate-400 font-bold">SHARED LOGS</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
            {audits.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-lg bg-[#0B0E14] border border-[#1E293B] hover:bg-slate-850/40 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 font-bold">{item.user}</span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {item.timestamp}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-200 mt-1.5 leading-snug">{item.action}</p>
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1E293B] text-[9px] font-mono">
                  <span className="text-blue-500 font-bold uppercase">CAT: {item.category}</span>
                  {item.status === 'passed' ? (
                    <span className="text-emerald-400 uppercase font-bold">● PASSED</span>
                  ) : (
                    <span className="text-amber-500 uppercase font-bold">● WARNING</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
