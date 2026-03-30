import React from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { navigationItems } from "../data/navigation";
import { useAuth } from "../context/AuthContext";
import { signOutUser } from "../services/authService";

const defaultTitle = "Home";
const pageTitles = {
  "/dashboard": "Home",
  "/crm": "CRM / Leads",
  "/customers": "Customers",
  "/applications": "Applications",
  "/countries": "Countries",
  "/documents": "Documents",
  "/payments": "Payments",
  "/hr": "HR",
  "/communication": "Notifications",
  "/audit-logs": "Audit Logs",
  "/workflow": "Workflow Automation",
  "/tasks": "Tasks",
  "/reports": "Reports",
  "/admin": "Settings",
  "/settings": "Settings",
};

export default function TopNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const activeItem = navigationItems.find((item) => {
    if (item.path === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }

    return location.pathname.startsWith(item.path);
  });

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleLogout = async () => {
    try {
      await signOutUser();
      setMenuOpen(false);
      navigate("/login", { replace: true });
    } catch (error) {
      alert(error.message || "Unable to log out.");
    }
  };

  return (
    <header className="top-navbar mb-6">
      <div className="top-navbar__leading">
        <div className="top-navbar__intro">
          <h1 className="text-2xl font-semibold">{pageTitles[activeItem?.path] ?? defaultTitle}</h1>
          <p className="text-sm text-gray-500">Modern visa consultancy dashboard</p>
        </div>
      </div>

      <div className="top-navbar__meta">
        <label className="top-navbar__search">
          <span>Search</span>
          <div className="top-navbar__search-row">
            <span className="top-navbar__search-icon" aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M8.5 14a5.5 5.5 0 110-11 5.5 5.5 0 010 11zm7 2l-3.3-3.3" />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Search applicants, invoices, tasks"
            />
          </div>
        </label>
        <button className="top-navbar__icon-button" type="button" aria-label="Notifications">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M10 3.5a3.5 3.5 0 00-3.5 3.5v1.2c0 .7-.2 1.4-.6 2L5 12h10l-.9-1.8a4.5 4.5 0 01-.6-2V7A3.5 3.5 0 0010 3.5z" />
            <path d="M8.5 14a1.5 1.5 0 003 0" />
          </svg>
          <span className="top-navbar__dot" />
        </button>
        {currentUser ? (
          <div style={{ position: "relative" }}>
            <button
              className="top-navbar__user"
              type="button"
              onClick={() => setMenuOpen((previousValue) => !previousValue)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              style={{ cursor: "pointer", border: "1px solid rgba(226, 232, 240, 0.9)" }}
            >
              <div className="top-navbar__avatar" aria-hidden="true">
                {(currentUser?.name ?? "VM").slice(0, 2).toUpperCase()}
              </div>
              <div className="top-navbar__user-copy">
                <strong className="font-semibold">{currentUser?.name ?? "Operations Team"}</strong>
                <span className="text-sm text-gray-500">{currentUser?.organization_name ?? today}</span>
              </div>
            </button>
            {menuOpen ? (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  minWidth: "140px",
                  padding: "8px",
                  borderRadius: "12px",
                  background: "#ffffff",
                  border: "1px solid rgba(226, 232, 240, 0.9)",
                  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.12)",
                  zIndex: 10,
                }}
              >
                <button
                  className="ghost-button"
                  type="button"
                  onClick={handleLogout}
                  style={{ width: "100%", justifyContent: "flex-start" }}
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <button className="secondary-button" type="button" onClick={() => navigate("/login")}>
            Login
          </button>
        )}
      </div>
    </header>
  );
}
