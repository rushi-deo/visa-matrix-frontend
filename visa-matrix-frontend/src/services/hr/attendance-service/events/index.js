import { hrEventBus } from "../../shared/events/eventBus.js";

export const emitLeaveApplied = async ({ actorId, referenceId, organization_id, leaveRequest }) =>
  hrEventBus.emit("leave.applied", {
    actorId,
    organizationId: organization_id,
    referenceId,
    payload: {
      module: "attendance",
      organization_id,
      leaveRequest,
    },
  });

export const emitLeaveApproved = async ({ actorId, referenceId, organization_id, leaveRequest }) =>
  hrEventBus.emit("leave.approved", {
    actorId,
    organizationId: organization_id,
    referenceId,
    payload: {
      module: "attendance",
      organization_id,
      leaveRequest,
    },
  });

