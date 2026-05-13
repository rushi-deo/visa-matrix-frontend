import React from "react";
import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import DashboardLayout from "../layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/api";

const fallbackNotifications = [
  {
    id: "NTF-1",
    title: "Application created",
    message: "A new application was created and assigned for review.",
    module: "notifications",
    created_at: "2026-03-18T11:30:00.000Z",
    organization_id: "ORG-INTERNAL",
  },
  {
    id: "NTF-2",
    title: "Invoice updated",
    message: "An invoice payment status changed and needs acknowledgement.",
    module: "invoicing",
    created_at: "2026-03-18T12:00:00.000Z",
    organization_id: "ORG-AGENCY-1",
  },
];

export default function Communication() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const result = await apiRequest("/notifications");
        const payload = result.data;

        if (!result.success) {
          throw new Error(result.error || "Failed to load notifications.");
        }

        if (isMounted) {
          setNotifications(Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : []);
        }
      } catch {
        if (isMounted) {
          setNotifications(
            fallbackNotifications.filter(
              (notification) =>
                currentUser?.role === "admin" ||
                notification.organization_id === currentUser?.organization_id,
            ),
          );
        }
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.organization_id, currentUser?.role]);

  return (
    <DashboardLayout>
      <PageHeader
        title="Notifications"
        description="User-specific operational notifications for application creation and invoice activity."
      />

      <section className="cards-grid">
        {(Array.isArray(notifications) ? notifications : []).map((notification) => (
          <article className="message-thread" key={notification.id}>
            <span className="profile-card__eyebrow">{notification.module}</span>
            <div className="message-thread">
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
              <small>{notification.created_at}</small>
            </div>
          </article>
        ))}
      </section>
    </DashboardLayout>
  );
}
