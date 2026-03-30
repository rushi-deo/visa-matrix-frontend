import React from "react";
const getStatusTone = (label) => {
  const normalizedLabel = label.toLowerCase();

  if (
    normalizedLabel.includes("approved") ||
    normalizedLabel.includes("paid") ||
    normalizedLabel.includes("verified") ||
    normalizedLabel.includes("completed") ||
    normalizedLabel.includes("converted") ||
    normalizedLabel.includes("live") ||
    normalizedLabel.includes("active") ||
    normalizedLabel.includes("uploaded")
  ) {
    return "success";
  }

  if (
    normalizedLabel.includes("pending") ||
    normalizedLabel.includes("follow-up") ||
    normalizedLabel.includes("open") ||
    normalizedLabel.includes("missing") ||
    normalizedLabel.includes("waiting") ||
    normalizedLabel.includes("overdue")
  ) {
    return "warning";
  }

  if (
    normalizedLabel.includes("review") ||
    normalizedLabel.includes("partial") ||
    normalizedLabel.includes("qualified") ||
    normalizedLabel.includes("scheduled") ||
    normalizedLabel.includes("progress") ||
    normalizedLabel.includes("processing") ||
    normalizedLabel.includes("filed")
  ) {
    return "info";
  }

  if (
    normalizedLabel.includes("escalated") ||
    normalizedLabel.includes("rejected") ||
    normalizedLabel.includes("blocked")
  ) {
    return "danger";
  }

  if (normalizedLabel.includes("draft")) {
    return "neutral";
  }

  return "neutral";
};

export default function StatusPill({ label }) {
  return <span className={`status-pill status-pill--${getStatusTone(label)}`}>{label}</span>;
}
