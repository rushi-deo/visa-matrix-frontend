import { createAuditLog } from "../../../../services/auditLogService.js";
import { createNotification } from "../../../../services/notificationService.js";
import { notificationService } from "../notification-service/services/index.js";
import { workflowService } from "../workflow-service/services/index.js";
import { hrEventBus } from "../shared/events/eventBus.js";

const subscriptionFlag = "__VM_HR_EVENT_SUBSCRIBERS__";

export const registerHrEventSubscribers = () => {
  if (globalThis[subscriptionFlag]) {
    return;
  }

  const auditListener = async ({ eventName, actorId, organizationId, referenceId, payload = {} }) => {
    await createAuditLog({
      user_id: actorId ?? null,
      organization_id: organizationId ?? null,
      action: eventName,
      module: payload.module ?? "hr",
      entity_id: referenceId ?? null,
      metadata: payload,
    });
  };

  const notificationListener = async ({ eventName, actorId, referenceId, payload = {} }) => {
    const messageMap = {
      "employee.created": `Employee ${payload.employee?.name ?? ""} has been onboarded.`,
      "leave.applied": `Leave request ${referenceId} was submitted for approval.`,
      "leave.approved": `Leave request ${referenceId} was approved.`,
      "payroll.processed": `Payroll ${referenceId} was processed successfully.`,
      "candidate.moved_stage": `Candidate ${payload.candidate?.name ?? ""} moved to ${payload.toStage}.`,
    };

    const message = messageMap[eventName] ?? `HR event received: ${eventName}`;
    await notificationService.createNotification({
      user_id: actorId ?? null,
      type: "event",
      message,
      reference_id: referenceId ?? null,
    });

    await createNotification({
      user_id: actorId ?? null,
      organization_id: payload.organization_id ?? null,
      title: "HR Event",
      message,
      module: payload.module ?? "hr",
      entity_id: referenceId ?? null,
    });
  };

  const workflowListener = async ({ eventName, actorId, referenceId, payload = {} }) => {
    if (eventName === "leave.applied") {
      await workflowService.autoCreateWorkflowInstance({
        module: "attendance",
        reference_id: referenceId,
        actor_id: actorId,
      });
      return;
    }

    if (eventName === "leave.approved") {
      await workflowService.markWorkflowReferenceApproved(referenceId, actorId);
      return;
    }

    if (eventName === "candidate.moved_stage" && payload.toStage === "offer") {
      await workflowService.autoCreateWorkflowInstance({
        module: "recruitment",
        reference_id: referenceId,
        actor_id: actorId,
      });
    }
  };

  ["employee.created", "leave.applied", "leave.approved", "payroll.processed", "candidate.moved_stage"].forEach(
    (eventName) => {
      hrEventBus.on(eventName, (payload) => auditListener({ ...payload, eventName }));
      hrEventBus.on(eventName, (payload) => notificationListener({ ...payload, eventName }));
      hrEventBus.on(eventName, (payload) => workflowListener({ ...payload, eventName }));
    },
  );

  globalThis[subscriptionFlag] = true;
};
