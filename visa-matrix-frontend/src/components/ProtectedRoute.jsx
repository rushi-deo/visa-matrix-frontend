import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
  module,
  action = "view",
  fallbackTitle = "Access Restricted",
}) {
  const { canAccess, loading, currentUser } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <DashboardLayout>
        <section className="panel">
          <div className="panel__header">
            <div>
              <h3>Loading access profile</h3>
              <p>Checking role, permissions, and organization scope.</p>
            </div>
          </div>
        </section>
      </DashboardLayout>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (module && !canAccess(module, action)) {
    return (
      <DashboardLayout>
        <section className="panel">
          <div className="panel__header">
            <div>
              <h3>{fallbackTitle}</h3>
              <p>
                {currentUser?.name ?? "Current user"} does not have `{action}` access for the
                `{module}` module.
              </p>
            </div>
          </div>
        </section>
      </DashboardLayout>
    );
  }

  return children;
}
