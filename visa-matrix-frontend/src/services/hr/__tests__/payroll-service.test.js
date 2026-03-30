import test from "node:test";
import assert from "node:assert/strict";
import { payrollService } from "../payroll-service/services/index.js";

test("processPayroll calculates gross, tax, and net pay", async () => {
  const result = await payrollService.processPayroll(
    {
      employee_id: "emp-1003",
      pay_period: "2026-03",
      tax_rate: 0.1,
      reimbursements: 2000,
      status: "processed",
    },
    "USR-ADMIN-1",
  );

  assert.equal(result.employee_id, "emp-1003");
  assert.equal(result.pay_period, "2026-03");
  assert.ok(result.gross_pay > result.net_pay);
  assert.ok(result.payslip.summary.netPay > 0);
});

