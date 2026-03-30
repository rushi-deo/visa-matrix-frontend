import React from "react";
import { Link, useLocation } from "react-router-dom";
import { navigationItems } from "../data/navigation";
import { useAuth } from "../context/AuthContext";

const primaryPaths = [
  "/dashboard",
  "/customers",
  "/applications",
  "/countries",
  "/documents",
  "/payments",
  "/hr/dashboard",
  "/communication",
  "/audit-logs",
  "/tasks",
  "/reports",
  "/admin",
  "/settings",
];

const sidebarLabels = {
  "/dashboard": "Home",
  "/customers": "Customers",
  "/applications": "Applications",
  "/countries": "Countries",
  "/documents": "Documents",
  "/payments": "Payments",
  "/hr/dashboard": "HR",
  "/communication": "Notifications",
  "/audit-logs": "Audit Logs",
  "/tasks": "Tasks",
  "/reports": "Reports",
  "/admin": "Admin",
  "/settings": "Settings",
};

const menuIcons = {
  "/dashboard": (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M4 4.5h5v5H4zm7 0h5v7h-5zm-7 7h5v4H4zm7 2h5v2.5h-5z" />
    </svg>
  ),
  "/customers": (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M7 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm6 1a2 2 0 100-4 2 2 0 000 4z" />
      <path d="M2.5 15a4.5 4.5 0 019 0m1.5 0a3.5 3.5 0 014.5-3.3" />
    </svg>
  ),
  "/applications": (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M6 3.5h6l3 3v10H6z" />
      <path d="M12 3.5v3h3M8 10h5M8 13h5" />
    </svg>
  ),
  "/countries": (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M10 2.5a7.5 7.5 0 100 15 7.5 7.5 0 000-15z" />
      <path d="M3 10h14M10 2.5c2 2.1 3 4.6 3 7.5s-1 5.4-3 7.5m0-15C8 4.6 7 7.1 7 10s1 5.4 3 7.5" />
    </svg>
  ),
  "/documents": (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M6 3.5h6l3 3v10H6z" />
      <path d="M12 3.5v3h3M8 11.5l1.3 1.3L12.5 9.5" />
    </svg>
  ),
  "/payments": (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M3.5 6.5h13v7h-13z" />
      <path d="M3.5 8.5h13M6 11h3" />
    </svg>
  ),
  "/hr/dashboard": (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M7 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm6 1a2 2 0 100-4 2 2 0 000 4z" />
      <path d="M2.5 15a4.5 4.5 0 019 0m1.5 0a3.5 3.5 0 014.5-3.3" />
    </svg>
  ),
  "/communication": (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M4 5.5h12v8H8l-4 3z" />
    </svg>
  ),
  "/audit-logs": (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M5 4.5h10v11H5z" />
      <path d="M7.5 8h5M7.5 11h5" />
    </svg>
  ),
  "/tasks": (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M4.5 5.5h2m3 0h6M4.5 10h2m3 0h6M4.5 14.5h2m3 0h6" />
      <path d="M4.5 5.5l1 1 1.5-2M4.5 10l1 1 1.5-2M4.5 14.5l1 1 1.5-2" />
    </svg>
  ),
  "/reports": (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M4 15.5V9m4 6.5V5.5m4 10V11m4 4.5V7.5" />
    </svg>
  ),
  "/admin": (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M10 3.5l1.6.7 1.7-.4.9 1.5 1.6.8-.2 1.8 1 1.4-1 1.4.2 1.8-1.6.8-.9 1.5-1.7-.4-1.6.7-1.6-.7-1.7.4-.9-1.5-1.6-.8.2-1.8-1-1.4 1-1.4-.2-1.8 1.6-.8.9-1.5 1.7.4z" />
      <path d="M10 12.2a2.2 2.2 0 100-4.4 2.2 2.2 0 000 4.4z" />
    </svg>
  ),
  "/settings": (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M10 3.5l1.6.7 1.7-.4.9 1.5 1.6.8-.2 1.8 1 1.4-1 1.4.2 1.8-1.6.8-.9 1.5-1.7-.4-1.6.7-1.6-.7-1.7.4-.9-1.5-1.6-.8.2-1.8-1-1.4 1-1.4-.2-1.8 1.6-.8.9-1.5 1.7.4z" />
      <path d="M10 12.2a2.2 2.2 0 100-4.4 2.2 2.2 0 000 4.4z" />
    </svg>
  ),
};

export default function Sidebar() {
  const location = useLocation();
  const { canAccess } = useAuth();
  const primaryNavigation = navigationItems.filter(
    (item) =>
      primaryPaths.includes(item.path) &&
      (!item.module || canAccess(item.module, "view")) &&
      item.path !== "/settings",
  );

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <Link className="sidebar__brand flex items-center gap-2" to="/">
          <span className="sidebar__brand-mark p-2 rounded-lg inline-block mb-8">
            <img src="/logo.png" alt="Logo" className="h-12 w-auto object-contain" />
          </span>
        </Link>
      </div>

      <nav className="sidebar__nav" aria-label="Primary">
        {primaryNavigation.map((item) => {
          const isDashboardRoute =
            item.path === "/dashboard" &&
            (location.pathname === "/" || location.pathname === "/dashboard");
          const isActive =
            isDashboardRoute ||
            (item.path !== "/" && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              className={`sidebar__link ${isActive ? "sidebar__link--active" : ""}`}
              to={item.path}
            >
              <span className="sidebar__icon" aria-hidden="true">
                {menuIcons[item.path]}
              </span>
              <span className="sidebar__label">
                {sidebarLabels[item.path] ?? item.shortLabel ?? item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <span className="sidebar__footer-label">Operations Snapshot</span>
        <strong>Modern visa consultancy dashboard</strong>
        <p>Track cases, payments, permissions, and agency access from one clean workspace.</p>
      </div>
    </aside>
  );
}
