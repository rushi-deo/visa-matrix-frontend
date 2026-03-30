import test from "node:test";
import assert from "node:assert/strict";
import { workflowService } from "../workflow-service/services/index.js";

test("advanceInstance moves workflow to next step for valid approver", async () => {
  const createdInstance = await workflowService.autoCreateWorkflowInstance({
    module: "recruitment",
    reference_id: "cand-test-001",
    actor_id: "USR-MANAGER-1",
  });

  const result = await workflowService.advanceInstance(
    createdInstance.id,
    { id: "USR-MANAGER-1", role: "hr" },
    { decision: "approved", remarks: "Shortlisted." },
  );

  assert.equal(result.steps[0].status, "approved");
  assert.ok(["in_progress", "approved"].includes(result.status));
});

