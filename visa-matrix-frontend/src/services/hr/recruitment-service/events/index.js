import { hrEventBus } from "../../shared/events/eventBus.js";

export const emitCandidateMovedStage = async ({
  actorId,
  organization_id,
  referenceId,
  candidate,
  fromStage,
  toStage,
}) =>
  hrEventBus.emit("candidate.moved_stage", {
    actorId,
    organizationId: organization_id,
    referenceId,
    payload: {
      module: "recruitment",
      organization_id,
      candidate,
      fromStage,
      toStage,
    },
  });

