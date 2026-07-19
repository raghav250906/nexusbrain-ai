import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  FileText,
  Network,
  Bot,
  Wrench,
  ShieldCheck,
  BarChart3,
  ClipboardList,
  Settings,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Brain,
  CircleDot
} from 'lucide-react';
import { ViewType, NavItem } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', category: 'core' },
  { id: 'documents', label: 'Documents', icon: 'FileText', category: 'core' },
  { id: 'knowledge-graph', label: 'Knowledge Graph', icon: 'Network', category: 'core' },
  { id: 'ai-copilot', label: 'AI Copilot', icon: 'Bot', category: 'core' },
  { id: 'maintenance', label: 'Maintenance', icon: 'Wrench', category: 'operations' },
  { id: 'compliance', label: 'Compliance', icon: 'ShieldCheck', category: 'operations' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3', category: 'management' },
  { id: 'reports', label: 'Reports', icon: 'ClipboardList', category: 'management' },
  { id: 'settings', label: 'Settings', icon: 'Settings', category: 'management' }
];

export default function Sidebar({
  currentView,
  onViewChange,
  isCollapsed,
  setIsCollapsed,
  isOpenMobile,
  setIsOpenMobile
}: SidebarProps) {
  
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard': return <LayoutDashboard className="w-4.5 h-4.5" />;
      case 'FileText': return <FileText className="w-4.5 h-4.5" />;
      case 'Network': return <Network className="w-4.5 h-4.5" />;
      case 'Bot': return <Bot className="w-4.5 h-4.5 text-amber-400" />;
      case 'Wrench': return <Wrench className="w-4.5 h-4.5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-4.5 h-4.5" />;
      case 'BarChart3': return <BarChart3 className="w-4.5 h-4.5" />;
      case 'ClipboardList': return <ClipboardList className="w-4.5 h-4.5" />;
      case 'Settings': return <Settings className="w-4.5 h-4.5" />;
      default: return <CircleDot className="w-4.5 h-4.5" />;
    }
  };

  const renderNavGroup = (category: 'core' | 'operations' | 'management', title: string) => {
    const items = NAV_ITEMS.filter(item => item.category === category);
    
    return (
      <div className="mb-6">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="px-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-2"
            >
              {title}
            </motion.p>
          )}
        </AnimatePresence>
        <div className="space-y-1 px-2">
          {items.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setIsOpenMobile(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 relative group ${
                  isActive
                    ? 'text-white bg-blue-600/10 border border-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {/* Active glow side pill */}
                {isActive && (
                  <motion.div
                    layoutId="activePill"
                    className="absolute left-0 w-1 h-5 bg-blue-500 rounded-r-md"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <div className={`transition-transform duration-200 ${isActive ? 'scale-110 text-blue-500' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {getIconComponent(item.icon)}
                </div>

                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap overflow-hidden text-ellipsis text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Collapsed state tooltip */}
                {isCollapsed && (
                  <div className="absolute left-16 scale-0 group-hover:scale-100 transition-all duration-150 origin-left bg-[#0F1219] border border-[#1E293B] text-slate-200 text-xs py-1.5 px-3 rounded-md font-medium shadow-xl whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B0E14] border-r border-[#1E293B]">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#1E293B]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-white animate-pulse" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-white tracking-tight text-lg select-none whitespace-nowrap"
              >
                NexusBrain
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Toggle Collapse Desktop button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex w-6 h-6 rounded-md border border-[#1E293B] bg-[#0F1219] hover:bg-slate-800 text-slate-400 hover:text-slate-100 items-center justify-center transition-colors shrink-0 outline-none"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto pt-6 scrollbar-thin">
        {renderNavGroup('core', 'Main Menu')}
        {renderNavGroup('operations', 'Enterprise')}
        {renderNavGroup('management', 'Governance')}
      </div>

      {/* Sidebar Footer with Token Usage Limit Progress bar */}
      <div className="p-4 border-t border-[#1E293B] bg-[#0F1219]/40">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-3"
            >
              <div className="bg-slate-800/40 p-3 rounded-lg border border-[#1E293B]">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Tokens Used</div>
                <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[65%]"></div>
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-medium">
                  <span>65.2k</span>
                  <span>100k limit</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                <span className="text-[10px] text-slate-400 font-mono">v2.4.0-PRO • Synced</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <div className="relative group/footer">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-500 cursor-pointer">
                  65%
                </div>
                <div className="absolute left-12 top-0 scale-0 group-hover/footer:scale-100 transition-all duration-150 origin-left bg-[#0F1219] border border-[#1E293B] text-slate-200 text-xs py-1.5 px-3 rounded-md font-medium shadow-xl whitespace-nowrap z-50">
                  65.2k / 100k Tokens Used
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar container */}
      <motion.aside
        animate={{ width: isCollapsed ? 70 : 260 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden md:block h-screen fixed top-0 left-0 z-30 shrink-0"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Drawer (Absolute overlay) */}
      <AnimatePresence>
        {isOpenMobile && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpenMobile(false)}
              className="md:hidden fixed inset-0 bg-black z-40"
            />
            
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 left-0 h-screen w-[260px] z-50 shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
