import React from "react";
import HrWorkspaceLayout from "../features/hr/components/HrWorkspaceLayout";

export default function HRPlaceholderWorkspace({ title, description }) {
  return (
    <HrWorkspaceLayout title={title} description={description}>
      <article className="panel hr-placeholder-panel">
        <div>
          <span className="page-header__eyebrow">Workspace Placeholder</span>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <span className="tag">Backend integration ready</span>
      </article>
    </HrWorkspaceLayout>
  );
}
