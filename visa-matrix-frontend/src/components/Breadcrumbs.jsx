import React from "react";
import { Link, useLocation } from "react-router-dom";
import { navigationItems } from "../data/navigation";

export default function Breadcrumbs({ currentLabel }) {
  const location = useLocation();
  const activeItem = navigationItems.find((item) => {
    if (item.path === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }

    return location.pathname.startsWith(item.path);
  });

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <Link to="/">Home</Link>
      <span>/</span>
      <span>{currentLabel ?? activeItem?.label ?? "Home"}</span>
    </nav>
  );
}
