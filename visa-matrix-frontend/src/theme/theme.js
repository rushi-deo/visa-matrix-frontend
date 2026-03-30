export const theme = {
  primary: "#0F172A",
  secondary: "#2563EB",
  accent: "#22C55E",
  background: "#F8FAFC",
  text: "#1E293B",
};

export const applyTheme = () => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;

  root.style.setProperty("--vm-primary", theme.primary);
  root.style.setProperty("--vm-secondary", theme.secondary);
  root.style.setProperty("--vm-accent", theme.accent);
  root.style.setProperty("--vm-background", theme.background);
  root.style.setProperty("--vm-text", theme.text);
  root.style.setProperty("--app-bg", theme.background);
  root.style.setProperty("--sidebar-bg", theme.primary);
  root.style.setProperty("--sidebar-text", "#E2E8F0");
  root.style.setProperty("--surface", "#FFFFFF");
  root.style.setProperty("--surface-subtle", "#EFF6FF");
  root.style.setProperty("--surface-muted", "#E2E8F0");
  root.style.setProperty("--text-main", theme.text);
  root.style.setProperty("--muted-text", "#475569");
  root.style.setProperty("--subtle-text", "#64748B");
  root.style.setProperty("--border-color", "rgba(148, 163, 184, 0.32)");
  root.style.setProperty("--panel-shadow", "0 18px 45px rgba(15, 23, 42, 0.10)");
};
