import React from "react";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ children }) {
  const { loading } = useAuth();

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <div className="dashboard-main">
        <TopNavbar />
        <main className="dashboard-content">{loading ? <section className="panel"><p>Loading workspace access...</p></section> : children}</main>
      </div>
    </div>
  );
}
