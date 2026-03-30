import React from "react";
import Breadcrumbs from "./Breadcrumbs";

export default function PageHeader({ title, description, action }) {
  return (
    <div className="page-header mb-6">
      <div>
        <Breadcrumbs currentLabel={title} />
        <span className="page-header__eyebrow">Workspace</span>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      {action ? <div className="page-header__action">{action}</div> : null}
    </div>
  );
}
