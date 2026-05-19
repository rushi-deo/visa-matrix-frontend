import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { navigationItems } from "../data/navigation";
import { useAuth } from "../context/AuthContext";
import { fetchNotifications } from "../services/notifications.service";
import { searchWorkspace } from "../services/search.service";

const defaultTitle = "Home";
const pageTitles = {
  "/dashboard": "Home",
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
  const { canAccess, currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchContainerRef = useRef(null);
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
  const canViewNotifications = canAccess("notifications", "view");
  const unreadNotifications = useMemo(
    () =>
      notifications.filter(
        (notification) => !(notification.is_read ?? notification.read_status ?? false),
      ).length,
    [notifications],
  );
  const visibleSearchResults = useMemo(
    () => searchResults.filter((result) => result.path !== "/crm" && result.type !== "lead"),
    [searchResults],
  );

  useEffect(() => {
    if (!currentUser || !canViewNotifications) {
      setNotifications([]);
      return undefined;
    }

    let isMounted = true;

    const loadNotifications = async () => {
      const nextNotifications = await fetchNotifications();

      if (isMounted) {
        setNotifications(nextNotifications);
      }
    };

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [canViewNotifications, currentUser]);

  useEffect(() => {
    if (!searchOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!searchContainerRef.current?.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [searchOpen]);

  useEffect(() => {
    if (!currentUser || !searchValue.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return undefined;
    }

    let isActive = true;
    setSearchLoading(true);

    const timerId = window.setTimeout(async () => {
      const nextResults = await searchWorkspace(searchValue);

      if (isActive) {
        setSearchResults(nextResults);
        setSearchLoading(false);
        setSearchOpen(true);
      }
    }, 250);

    return () => {
      isActive = false;
      window.clearTimeout(timerId);
    };
  }, [currentUser, searchValue]);

  useEffect(() => {
    setSearchOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    logout();
    setMenuOpen(false);
    navigate("/login", { replace: true });
  };

  const handleSearchSelect = (path) => {
    setSearchOpen(false);
    navigate(path);
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
        <label className="top-navbar__search" ref={searchContainerRef} style={{ position: "relative" }}>
          <span>Search</span>
          <div className="top-navbar__search-row">
            <span className="top-navbar__search-icon" aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M8.5 14a5.5 5.5 0 110-11 5.5 5.5 0 010 11zm7 2l-3.3-3.3" />
              </svg>
            </span>
            <input
              type="search"
              onChange={(event) => {
                setSearchValue(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => {
                if (searchValue.trim()) {
                  setSearchOpen(true);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && visibleSearchResults[0]?.path) {
                  event.preventDefault();
                  handleSearchSelect(visibleSearchResults[0].path);
                }
              }}
              placeholder="Search customers, applications, documents"
              value={searchValue}
            />
          </div>
          {searchOpen && searchValue.trim() ? (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                right: 0,
                background: "#ffffff",
                border: "1px solid rgba(226, 232, 240, 0.95)",
                borderRadius: "12px",
                boxShadow: "0 14px 30px rgba(15, 23, 42, 0.12)",
                overflow: "hidden",
                zIndex: 20,
              }}
            >
              {searchLoading ? (
                <div style={{ padding: "12px 14px", color: "#64748b" }}>Searching workspace...</div>
              ) : visibleSearchResults.length > 0 ? (
                visibleSearchResults.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => handleSearchSelect(result.path)}
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: "4px",
                      padding: "12px 14px",
                      border: 0,
                      borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
                      background: "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    <strong style={{ color: "#0f172a", textTransform: "capitalize" }}>
                      {result.title}
                    </strong>
                    <span style={{ color: "#2563eb" }}>{result.type}</span>
                    <span style={{ color: "#64748b" }}>
                      {result.subtitle}
                      {result.description ? ` • ${result.description}` : ""}
                    </span>
                  </button>
                ))
              ) : (
                <div style={{ padding: "12px 14px", color: "#64748b" }}>No matches found.</div>
              )}
            </div>
          ) : null}
        </label>
        <button
          className="top-navbar__icon-button"
          type="button"
          aria-label="Notifications"
          onClick={() => navigate("/communication")}
        >
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M10 3.5a3.5 3.5 0 00-3.5 3.5v1.2c0 .7-.2 1.4-.6 2L5 12h10l-.9-1.8a4.5 4.5 0 01-.6-2V7A3.5 3.5 0 0010 3.5z" />
            <path d="M8.5 14a1.5 1.5 0 003 0" />
          </svg>
          {canViewNotifications && unreadNotifications > 0 ? (
            <span
              style={{
                position: "absolute",
                top: "0.35rem",
                right: "0.35rem",
                minWidth: "1.1rem",
                height: "1.1rem",
                padding: "0 0.22rem",
                borderRadius: "999px",
                background: "#2563eb",
                boxShadow: "0 0 0 2px #ffffff",
                color: "#ffffff",
                fontSize: "0.65rem",
                fontWeight: 700,
                lineHeight: "1.1rem",
              }}
            >
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </span>
          ) : null}
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
