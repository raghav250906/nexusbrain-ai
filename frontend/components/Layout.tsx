"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
type ViewType = string;
import { ShieldCheck, Cpu, Terminal } from 'lucide-react';

interface LayoutProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  children: React.ReactNode;
}

export default function Layout({ currentView, onViewChange, children }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
      const cached = localStorage.getItem("nexus_sidebar_collapsed");
      if (cached) {
          setIsCollapsed(JSON.parse(cached));
      }
  }, []);
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  useEffect(() => {
    localStorage.setItem('nexus_sidebar_collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-300 flex overflow-hidden">
      {/* Dynamic Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={onViewChange}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Content Area */}
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-250 ease-in-out"
        style={{
  marginLeft: isCollapsed ? "80px" : "260px",
}}
      >
        {/* Dynamic Top Navbar */}
        <Navbar
          currentView={currentView}
          isOpenMobile={isOpenMobile}
          setIsOpenMobile={setIsOpenMobile}
        />

        {/* Content Shell with responsive padding & animated transitions */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative min-h-[calc(100vh-4rem-2.5rem)]">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-7xl mx-auto h-full"
          >
            {children}
          </motion.div>
        </main>

        {/* Minimal Professional Footer */}
        <footer className="h-10 border-t border-[#1E293B] bg-[#0F1219]/90 backdrop-blur-sm flex items-center justify-between px-6 text-[11px] text-slate-500 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">NexusBrain Enterprise</span>
            <span className="text-slate-700">|</span>
            <span>Ref: NB-E-38290</span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-blue-500/60" />
              <span>Core Engine: v2.4</span>
            </div>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500/60" />
              <span>FedRAMP compliant</span>
            </div>
          </div>
          <div>
            <span>UTC --:-- </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
