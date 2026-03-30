import React from "react";
import { useEffect, useMemo, useState } from "react";
import { fetchApplications } from "../../services/application.service";
import { getApplications } from "../../services/mockApi";
import {
  WORKFLOW_STEPS,
  getNormalizedWorkflowStep,
} from "../../utils/workflow";
import { ENABLE_ENHANCEMENTS } from "../config/ui.config";

const pipelineShellStyle = {
  display: "grid",
  gap: "1rem",
};

const pipelineGridStyle = {
  display: "grid",
  gap: "0.9rem",
  gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))",
};

const pipelineStepStyle = {
  position: "relative",
  overflow: "hidden",
  padding: "1rem",
  borderRadius: "14px",
  border: "1px solid rgba(226, 232, 240, 0.95)",
  background:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96))",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
};

const activePipelineStepStyle = {
  borderColor: "rgba(37, 99, 235, 0.28)",
  boxShadow: "0 18px 38px rgba(37, 99, 235, 0.12)",
};

const stageAccentStyle = (isActive) => ({
  position: "absolute",
  inset: "0 auto auto 0",
  width: "100%",
  height: "4px",
  background: isActive ? "linear-gradient(90deg, #2563eb, #0f172a)" : "#e2e8f0",
});

export default function WorkflowPipeline() {
  const [applications, setApplications] = useState(getApplications());

  useEffect(() => {
    let isMounted = true;

    const loadApplications = async () => {
      try {
        const nextApplications = await fetchApplications(getApplications());

        if (isMounted) {
          setApplications(nextApplications);
        }
      } catch {
        if (isMounted) {
          setApplications(getApplications());
        }
      }
    };

    loadApplications();

    return () => {
      isMounted = false;
    };
  }, []);

  const workflowSummary = useMemo(() => {
    const counts = WORKFLOW_STEPS.reduce(
      (summary, stage) => ({
        ...summary,
        [stage]: 0,
      }),
      {},
    );

    applications.forEach((application) => {
      const normalizedStep = getNormalizedWorkflowStep(application);
      counts[normalizedStep] = (counts[normalizedStep] ?? 0) + 1;
    });

    const dominantStage =
      WORKFLOW_STEPS.reduce(
        (currentDominant, stage) =>
          counts[stage] > counts[currentDominant] ? stage : currentDominant,
        WORKFLOW_STEPS[0],
      ) ?? WORKFLOW_STEPS[0];

    return {
      counts,
      dominantStage,
      totalApplications: applications.length,
    };
  }, [applications]);

  if (!ENABLE_ENHANCEMENTS) {
    return null;
  }

  return (
    <section className="panel" style={pipelineShellStyle}>
      <div className="panel__header">
        <div>
          <span className="page-header__eyebrow">Workflow Visibility</span>
          <h3>Visa processing pipeline</h3>
          <p>
            Track the current case mix from lead intake through document readiness,
            submission, and final outcome.
          </p>
        </div>
        <article
          className="mini-stat"
          style={{
            minWidth: "11rem",
            background: "#f8fbff",
          }}
        >
          <span>Dominant Stage</span>
          <strong>{workflowSummary.dominantStage}</strong>
        </article>
      </div>

      <div className="tag-list">
        <span className="tag">Total Cases: {workflowSummary.totalApplications}</span>
        <span className="tag">Fallback Safe</span>
        <span className="tag">API Ready</span>
      </div>

      <div style={pipelineGridStyle}>
        {WORKFLOW_STEPS.map((stage, index) => {
          const count = workflowSummary.counts[stage] ?? 0;
          const isDominantStage = workflowSummary.dominantStage === stage;

          return (
            <article
              key={stage}
              style={{
                ...pipelineStepStyle,
                ...(isDominantStage ? activePipelineStepStyle : {}),
              }}
            >
              <span style={stageAccentStyle(isDominantStage)} />
              <span className="page-header__eyebrow">Step {index + 1}</span>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  marginTop: "0.7rem",
                }}
              >
                <div style={{ display: "grid", gap: "0.4rem" }}>
                  <strong style={{ fontSize: "1.02rem" }}>{stage}</strong>
                  <span className="empty-state">
                    {isDominantStage ? "Highest active volume" : "Active workflow lane"}
                  </span>
                </div>
                <strong
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "2.75rem",
                    height: "2.75rem",
                    borderRadius: "999px",
                    background: isDominantStage ? "#dbeafe" : "#f8fafc",
                    color: isDominantStage ? "#1d4ed8" : "#0f172a",
                    fontSize: "1rem",
                  }}
                >
                  {count}
                </strong>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
