export const WORKFLOW_STEPS = [
  "Lead",
  "Documents Pending",
  "Submitted",
  "Processing",
  "Approved / Rejected",
];

const LEGACY_STAGE_TO_WORKFLOW_STEP = {
  Lead: "Lead",
  Consultation: "Lead",
  "Document Collection": "Documents Pending",
  "Application Filing": "Submitted",
  Submitted: "Submitted",
  "Embassy Processing": "Processing",
  Processing: "Processing",
  "Visa Approved / Rejected": "Approved / Rejected",
  Approved: "Approved / Rejected",
  Rejected: "Approved / Rejected",
};

const LEGACY_STATUS_TO_WORKFLOW_STEP = {
  Draft: "Lead",
  "Documents Pending": "Documents Pending",
  Submitted: "Submitted",
  Filed: "Submitted",
  Processing: "Processing",
  "Embassy Processing": "Processing",
  Approved: "Approved / Rejected",
  Rejected: "Approved / Rejected",
};

export const FINAL_WORKFLOW_DECISIONS = ["Approved", "Rejected"];

export function getNormalizedWorkflowStep(application) {
  const stageMatch = LEGACY_STAGE_TO_WORKFLOW_STEP[application?.stage];

  if (stageMatch) {
    return stageMatch;
  }

  return LEGACY_STATUS_TO_WORKFLOW_STEP[application?.status] ?? "Lead";
}

export function getWorkflowStatus(step, finalDecision = "Approved") {
  if (step === "Approved / Rejected") {
    return finalDecision;
  }

  return step;
}

export function normalizeApplicationWorkflow(application) {
  const normalizedStep = getNormalizedWorkflowStep(application);
  const finalDecision = FINAL_WORKFLOW_DECISIONS.includes(application?.status)
    ? application.status
    : "Approved";

  return {
    ...application,
    stage: normalizedStep,
    status: getWorkflowStatus(normalizedStep, finalDecision),
  };
}

export function getAllowedWorkflowTransitions(application) {
  const currentStep = getNormalizedWorkflowStep(application);
  const currentIndex = WORKFLOW_STEPS.indexOf(currentStep);

  if (currentIndex === -1) {
    return [WORKFLOW_STEPS[0]];
  }

  if (currentStep === "Approved / Rejected") {
    return [currentStep];
  }

  return [currentStep, WORKFLOW_STEPS[currentIndex + 1]].filter(Boolean);
}

export function isWorkflowTransitionAllowed(application, targetStep) {
  return getAllowedWorkflowTransitions(application).includes(targetStep);
}

export function applyWorkflowTransition(
  application,
  targetStep,
  finalDecision = "Approved",
) {
  if (!application || !isWorkflowTransitionAllowed(application, targetStep)) {
    return application;
  }

  return {
    ...application,
    stage: targetStep,
    status: getWorkflowStatus(targetStep, finalDecision),
  };
}
