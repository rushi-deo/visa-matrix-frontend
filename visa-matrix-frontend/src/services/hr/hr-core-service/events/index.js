import { hrEventBus } from "../../shared/events/eventBus.js";

export const emitEmployeeCreated = async ({ actorId, organization_id, employee }) =>
  hrEventBus.emit("employee.created", {
    actorId,
    organizationId: organization_id,
    referenceId: employee.id,
    payload: {
      module: "hr",
      organization_id,
      employee,
    },
  });

