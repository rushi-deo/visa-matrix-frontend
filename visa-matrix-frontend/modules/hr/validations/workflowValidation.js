import {
  ensureObject,
  optionalArray,
  optionalString,
  requireEnum,
  requireIdentifier,
  requireString,
} from "./validationHelpers.js";
import { createHttpError } from "../services/hrErrorService.js";

export const validateWorkflowParams = (params) => ({
  id: requireIdentifier(params.id, "id"),
});

export const validateCreateWorkflowBody = (body = {}) => ({
  name: requireString(body.name, "name"),
  type: requireString(body.type, "type"),
  steps: (() => {
    const steps = optionalArray(body.steps, "steps").map((step, index) => {
      const normalizedStep = ensureObject(step, `steps[${index}]`);
      return {
        step_order: Number(normalizedStep.step_order || index + 1),
        approver_role: requireEnum(
          normalizedStep.approver_role,
          `steps[${index}].approver_role`,
          ["admin", "hr", "employee"],
        ),
      };
    });

    if (!steps.length) {
      throw createHttpError(400, "steps is required.");
    }

    return steps;
  })(),
});

export const validateExecuteWorkflowBody = (body = {}) => ({
  context: body.context ? ensureObject(body.context, "context") : null,
  approvals: optionalArray(body.approvals, "approvals").map((approval, index) => {
    const normalizedApproval = ensureObject(approval, `approvals[${index}]`);
    return {
      step_order: normalizedApproval.step_order,
      approver_role: requireEnum(
        normalizedApproval.approver_role,
        `approvals[${index}].approver_role`,
        ["admin", "hr", "employee"],
      ),
      decision: requireEnum(
        normalizedApproval.decision,
        `approvals[${index}].decision`,
        ["approved", "rejected"],
      ),
      comment: optionalString(normalizedApproval.comment, `approvals[${index}].comment`),
    };
  }),
});
