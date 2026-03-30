import { hrEventBus } from "../../shared/events/eventBus.js";

export const emitPayrollProcessed = async ({ actorId, referenceId, organization_id, payrollLog }) =>
  hrEventBus.emit("payroll.processed", {
    actorId,
    organizationId: organization_id,
    referenceId,
    payload: {
      module: "payroll",
      organization_id,
      payrollLog,
    },
  });

