"use client";

import React, { useState } from "react";
import Layout from "@/components/Layout";
import DashboardView from "@/components/DashboardView";
import DocumentsView from "@/components/DocumentsView";
import KnowledgeGraphView from "@/components/KnowledgeGraphView";
import AICopilotView from "@/components/AICopilotView";
import MaintenanceView from "@/components/MaintenanceView";
import ComplianceView from "@/components/ComplianceView";
import AnalyticsView from "@/components/AnalyticsView";
import ReportsView from "@/components/ReportsView";
import SettingsView from "@/components/SettingsView";

type ViewType =
  | "dashboard"
  | "documents"
  | "knowledge-graph"
  | "ai-copilot"
  | "maintenance"
  | "compliance"
  | "analytics"
  | "reports"
  | "settings";

export default function Home() {
  const [currentView, setCurrentView] =
    useState<ViewType>("dashboard");

  const handleViewChange = (view: string) => {
    setCurrentView(view as ViewType);
  };

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <DashboardView
            onNavigate={(view: ViewType) => setCurrentView(view)}
          />
        );

      case "documents":
        return <DocumentsView />;

      case "knowledge-graph":
        return <KnowledgeGraphView />;

      case "ai-copilot":
        return <AICopilotView />;

      case "maintenance":
        return <MaintenanceView />;

      case "compliance":
        return <ComplianceView />;

      case "analytics":
        return <AnalyticsView />;

      case "reports":
        return <ReportsView />;

      case "settings":
        return <SettingsView />;

      default:
        return (
          <DashboardView
            onNavigate={(view: ViewType) => setCurrentView(view)}
          />
        );
    }
  };

  return (
    <Layout
      currentView={currentView}
      onViewChange={handleViewChange}
    >
      {renderView()}
    </Layout>
  );
}