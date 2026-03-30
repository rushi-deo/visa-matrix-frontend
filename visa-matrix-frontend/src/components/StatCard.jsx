import React from "react";
export default function StatCard({ title, value, icon, color }) {
  return (
    <article
      className="stat-card bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition"
      style={{ "--card-accent": color }}
    >
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__body">
        <span className="stat-card__title text-sm text-gray-500">{title}</span>
        <strong className="stat-card__value text-xl font-semibold">{value}</strong>
      </div>
    </article>
  );
}
