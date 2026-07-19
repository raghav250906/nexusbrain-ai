import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  Shield,
  Key,
  Info,
  Sliders,
  CheckCircle,
  Clock,
  RefreshCw,
  SlidersHorizontal,
  Lock,
  Compass
} from 'lucide-react';
import PageHeader from './PageHeader';

export default function SettingsView() {
  const [cacheResponses, setCacheResponses] = useState(true);
  const [strictSafety, setStrictSafety] = useState(true);
  const [autoSummarize, setAutoSummarize] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSaveSettings = () => {
    setIsSaving(true);
    setIsSuccess(false);

    setTimeout(() => {
      setIsSaving(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Configurations"
        description="Manage secure credentials, toggle high-dimensional semantic clustering heuristics, and inspect current environment secrets."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Environment Secrets Configuration Guide */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Environment secret guide */}
          <div className="p-5 rounded-xl border border-[#1E293B] bg-[#0F1219] space-y-4 shadow-lg shadow-black/20">
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#1E293B]">
              <Key className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider text-[10px]">API Key Injection & Security Guidelines</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <p className="text-slate-400 leading-relaxed">
                Secrets like <span className="font-mono text-blue-500 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded text-[11px] font-bold">GEMINI_API_KEY</span> are securely injected by the environment control plane. They are kept encrypted in transit and never exposed to browser-side code.
              </p>

              <div className="p-3.5 bg-[#0B0E14] border border-[#1E293B] rounded-lg space-y-2.5">
                <span className="font-semibold text-slate-300 block">How to configure keys securely:</span>
                <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                  <li>Define necessary variables in <span className="font-mono text-[11px] text-blue-500 font-bold">.env.example</span></li>
                  <li>Configure actual credentials using the **Secrets** settings panel in your AI Studio editor.</li>
                  <li>The local Express proxy server will auto-inject the keys into APIs at runtime.</li>
                </ol>
              </div>

              <div className="flex gap-2.5 p-3 bg-blue-950/10 border border-blue-500/20 rounded-lg text-slate-400 leading-relaxed">
                <Info className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  By using backend proxy routing, you avoid exporting secrets to client bundles, preventing reverse-engineering exploits.
                </span>
              </div>
            </div>
          </div>

          {/* Heuristic Toggles */}
          <div className="p-5 rounded-xl border border-[#1E293B] bg-[#0F1219] space-y-4 shadow-lg shadow-black/20">
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#1E293B]">
              <SlidersHorizontal className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider text-[10px]">System Feature Toggles</span>
            </div>

            <div className="space-y-4 pt-1.5">
              {/* Cache responses */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-200 block">Cache model responses</span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Saves computation credits by checking local vector caches for recurrent semantically-identical requests.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCacheResponses(!cacheResponses)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 outline-none shrink-0 cursor-pointer ${
                    cacheResponses ? 'bg-blue-600' : 'bg-slate-850'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    cacheResponses ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Strict safety */}
              <div className="flex items-start justify-between gap-4 pt-4 border-t border-[#1E293B]">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-200 block">Strict security filtering</span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Forces strict validation on out-of-bounds tokens, preventing potential cognitive leaks or hallucinated entities.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStrictSafety(!strictSafety)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 outline-none shrink-0 cursor-pointer ${
                    strictSafety ? 'bg-blue-600' : 'bg-slate-850'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    strictSafety ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Auto summarize */}
              <div className="flex items-start justify-between gap-4 pt-4 border-t border-[#1E293B]">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-200 block">Auto-summarize knowledge tree</span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Injects automatically compiled markdown summaries back into the Synapse Matrix node tree on successful file ingestion.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoSummarize(!autoSummarize)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 outline-none shrink-0 cursor-pointer ${
                    autoSummarize ? 'bg-blue-600' : 'bg-slate-850'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    autoSummarize ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1E293B] flex justify-end gap-2.5">
              {isSuccess && (
                <span className="text-xs text-emerald-500 font-mono font-bold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> CONFIG SAVED
                </span>
              )}
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="h-8 px-4.5 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/30 text-xs font-bold uppercase tracking-wider text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer outline-none"
              >
                {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {isSaving ? 'Saving Changes...' : 'Save Configuration'}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Tenant Credentials Overview */}
        <div className="p-5 rounded-xl border border-[#1E293B] bg-[#0F1219] space-y-4 h-fit shadow-lg shadow-black/20">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#1E293B]">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider text-[10px]">Administrative Credentials</span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="p-3.5 bg-[#0B0E14] border border-[#1E293B] rounded-lg space-y-1">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">CURRENT TENANT</span>
              <span className="text-slate-200 font-bold font-sans text-xs">NexusBrain Corporation</span>
            </div>

            <div className="p-3.5 bg-[#0B0E14] border border-[#1E293B] rounded-lg space-y-1">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">TENANT ID</span>
              <span className="text-slate-300 font-bold">corp-nexus-01</span>
            </div>

            <div className="p-3.5 bg-[#0B0E14] border border-[#1E293B] rounded-lg space-y-1">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">SECURITY COORDINATION</span>
              <span className="text-emerald-500 font-bold flex items-center gap-1 text-[11px]">
                <Lock className="w-3.5 h-3.5 text-emerald-500" /> FIPS 140-2 Compliant
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
