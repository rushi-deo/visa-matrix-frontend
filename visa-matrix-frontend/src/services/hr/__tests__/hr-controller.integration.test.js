import test from "node:test";
import assert from "node:assert/strict";
import { hrCoreController } from "../hr-core-service/controllers/index.js";

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

test("hrCoreController.createEmployee returns 201 with employee payload", async () => {
  const req = {
    user: { id: "USR-ADMIN-1" },
    validated: {
      body: {
        organization_id: "ORG-INTERNAL",
        name: "Integration User",
        email: "integration.user@visamatrix.local",
        department: "Human Resources",
        job_title: "HR Analyst",
        employment_type: "full_time",
        location: "Remote",
        status: "onboarding",
      },
    },
  };
  const res = createResponse();

  await hrCoreController.createEmployee(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.name, "Integration User");
});
