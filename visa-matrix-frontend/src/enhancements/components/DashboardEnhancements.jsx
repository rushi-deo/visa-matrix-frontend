import React from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Dashboard from "../../Pages/Dashboard";
import { ENABLE_ENHANCEMENTS } from "../config/ui.config";
import EnhancedStatsCards from "./EnhancedStatsCards";
import RecentActivity from "./RecentActivity";
import WorkflowPipeline from "./WorkflowPipeline";

function EnhancementSlot({ children, position }) {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    if (!ENABLE_ENHANCEMENTS || typeof document === "undefined") {
      return undefined;
    }

    const dashboardContent = document.querySelector(".dashboard-content");

    if (!dashboardContent) {
      return undefined;
    }

    const container = document.createElement("div");
    container.setAttribute("data-dashboard-enhancement-slot", position);
    container.style.display = "grid";
    container.style.gap = "1.5rem";

    if (position === "top") {
      dashboardContent.prepend(container);
    } else {
      dashboardContent.appendChild(container);
    }

    setTarget(container);

    return () => {
      container.remove();
      setTarget(null);
    };
  }, [position]);

  if (!ENABLE_ENHANCEMENTS || !target) {
    return null;
  }

  return createPortal(children, target);
}

export default function DashboardEnhancements() {
  if (!ENABLE_ENHANCEMENTS) {
    return <Dashboard />;
  }

  return (
    <>
      <Dashboard />
      <EnhancementSlot position="top">
        <WorkflowPipeline />
        <EnhancedStatsCards />
      </EnhancementSlot>
      <EnhancementSlot position="bottom">
        <RecentActivity />
      </EnhancementSlot>
    </>
  );
}
