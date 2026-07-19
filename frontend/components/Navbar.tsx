import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  Building,
  User,
  Shield,
  Activity,
  LogOut,
  Sparkles,
  Database,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewType } from '../types';

interface NavbarProps {
  currentView: ViewType;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export default function Navbar({ currentView, isOpenMobile, setIsOpenMobile }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const getViewTitle = (view: ViewType) => {
    switch (view) {
      case 'dashboard': return 'Command Center';
      case 'documents': return 'Cognitive Memory Space';
      case 'knowledge-graph': return 'Knowledge Synapse Matrix';
      case 'ai-copilot': return 'AI Reasoning Copilot';
      case 'maintenance': return 'Engine Operations & Health';
      case 'compliance': return 'Compliance & Safety Audits';
      case 'analytics': return 'Telemetry & Cost Metrics';
      case 'reports': return 'Enterprise Performance Reports';
      case 'settings': return 'System Configurations';
      default: return 'NexusBrain AI';
    }
  };

  const notifications = [
    { id: '1', title: 'Knowledge sync completed', desc: 'Added 48 semantic connections into Synapse Matrix.', time: '2m ago', read: false },
    { id: '2', title: 'Compliance Audit passed', desc: 'No sensitive data leaks or residency issues detected.', time: '1h ago', read: false },
    { id: '3', title: 'Maintenance notice', desc: 'Scheduled maintenance for index optimizer in 2 hours.', time: '5h ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 border-b border-[#1E293B] bg-[#0F1219] flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
      {/* Left section: Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-[#0B0E14] border border-[#1E293B] text-slate-300 hover:text-slate-100 hover:bg-slate-850 outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <nav className="flex gap-2 text-xs text-slate-500 font-medium mb-1">
            <span>Enterprise</span>
            <span>/</span>
            <span className="text-blue-500 capitalize">{currentView.replace('-', ' ')}</span>
          </nav>
          <h1 className="text-xs md:text-sm font-semibold text-slate-400 leading-tight hidden sm:block">
            {getViewTitle(currentView)}
          </h1>
        </div>
      </div>

      {/* Middle section: High-fidelity Search */}
      <div className="hidden lg:flex max-w-md w-full mx-8 relative">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search anything..."
          className="w-full h-9 bg-[#0B0E14] border border-[#1E293B] rounded-full pl-10 pr-4 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
        />
        {searchValue && (
          <button onClick={() => setSearchValue('')} className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Right section: System Status, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {/* Humble system status indicators */}
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#0B0E14] border border-[#1E293B] text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">SYS Status:</span>
            <span className="text-emerald-400 font-mono font-semibold">Nominal</span>
          </div>
          <div className="w-px h-3 bg-[#1E293B]" />
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-blue-500 font-mono font-semibold">Synced</span>
          </div>
        </div>

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="w-9 h-9 rounded-full border border-[#1E293B] bg-[#0F1219]/40 hover:bg-white/5 text-slate-300 hover:text-white flex items-center justify-center transition-all relative outline-none"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 bg-[#0F1219] border border-[#1E293B] rounded-xl shadow-2xl shadow-black/40 z-40 overflow-hidden"
                >
                  <div className="px-4 py-3 bg-[#13171F] border-b border-[#1E293B] flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">System Notification Hub</span>
                    <span className="text-[10px] bg-blue-500/10 text-blue-500 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono font-semibold">
                      {unreadCount} Unread
                    </span>
                  </div>
                  <div className="divide-y divide-[#1E293B] max-h-72 overflow-y-auto">
                    {notifications.map((item) => (
                      <div key={item.id} className="p-3.5 hover:bg-slate-900/40 transition-colors flex gap-2.5">
                        <div className="mt-1 shrink-0">
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${item.read ? 'bg-slate-600' : 'bg-blue-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-200 truncate">{item.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                          <p className="text-[9px] text-slate-500 font-mono mt-1">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-3 py-2 bg-slate-900/20 border-t border-[#1E293B] text-center">
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-[10px] text-blue-500 hover:text-blue-400 font-bold uppercase tracking-wider"
                    >
                      Dismiss All Alerts
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 pl-2 pr-3 py-1 rounded-lg border border-[#1E293B] hover:border-slate-600 bg-transparent transition-all text-slate-300 outline-none"
          >
            <div className="hidden md:flex flex-col text-right shrink-0">
              <div className="text-xs font-semibold text-white">Alex Sterling</div>
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Admin View</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border border-[#1E293B] flex items-center justify-center text-xs font-bold text-white select-none">
              AS
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowProfile(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-[#0F1219] border border-[#1E293B] rounded-xl shadow-2xl shadow-black/40 z-40 overflow-hidden divide-y divide-[#1E293B]"
                >
                  <div className="p-3.5 bg-slate-900/30">
                    <p className="text-xs font-semibold text-slate-200">Raghav Rana</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">raghav2006rana@gmail.com</p>
                  </div>
                  
                  <div className="p-1 space-y-0.5">
                    <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400">
                      <Building className="w-4 h-4 text-slate-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-slate-300 truncate">NexusBrain Org</p>
                        <p className="text-[9px] text-slate-500 font-mono uppercase">Global Tenant</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-1 space-y-0.5">
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-900/60 transition-colors text-left">
                      <User className="w-4 h-4 text-slate-500" />
                      <span>Account Management</span>
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-900/60 transition-colors text-left">
                      <Shield className="w-4 h-4 text-slate-500" />
                      <span>Workspace Security</span>
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-900/60 transition-colors text-left">
                      <Activity className="w-4 h-4 text-slate-500" />
                      <span>Auditor Credentials</span>
                    </button>
                  </div>

                  <div className="p-1">
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left">
                      <LogOut className="w-4 h-4" />
                      <span>Terminate Session</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
