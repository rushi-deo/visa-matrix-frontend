import React from "react";
import { NavLink } from "react-router-dom";
import PageHeader from "../../../components/PageHeader";
import DashboardLayout from "../../../layout/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import "../hr.css";

const sections = [
  { path: "/hr/dashboard", label: "Dashboard", roles: ["super_admin", "admin", "hr", "finance"] },
  { path: "/hr/employees", label: "Employees", roles: ["super_admin", "admin", "hr"] },
  { path: "/hr/payroll", label: "Payroll", roles: ["super_admin", "admin", "hr", "finance"] },
  { path: "/hr/workflows", label: "Workflows", roles: ["super_admin", "admin", "hr"] },
  { path: "/hr/recruitment", label: "Recruitment", roles: ["super_admin", "admin", "hr"] },
  { path: "/hr/performance", label: "Performance", roles: ["super_admin", "admin", "hr"] },
];

export default function HrWorkspaceLayout({ title, description, action, children }) {
  const { currentUser } = useAuth();
  const visibleSections = sections.filter((section) => section.roles.includes(currentUser?.role ?? ""));

  return (
    <DashboardLayout>
      <PageHeader title={title} description={description} action={action} />
      <section className="hr-hero">
        <div>
          <span className="page-header__eyebrow">Enterprise HR Command Center</span>
          <h3>Workforce operations, payroll controls, workflows, analytics, and AI signals in one secure workspace.</h3>
        </div>
        <div className="hr-hero-badges">
          <span className="tag">Role: {currentUser?.role}</span>
          <span className="tag">Secure API: /api/v1/hr</span>
          <span className="tag">RLS Ready</span>
        </div>
      </section>
      <nav className="hr-nav" aria-label="HR workspace">
        {visibleSections.map((section) => (
          <NavLink
            key={section.path}
            className={({ isActive }) => `hr-nav__link ${isActive ? "hr-nav__link--active" : ""}`}
            to={section.path}
          >
            {section.label}
          </NavLink>
        ))}
      </nav>
      {children}
    </DashboardLayout>
  );
}
