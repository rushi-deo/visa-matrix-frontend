import { aiRepository } from "../repository/index.js";

const deriveAttritionSignals = (employees, performanceReviews) =>
  employees.map((employee) => {
    const review = performanceReviews.find((item) => item.employee_id === employee.id);
    const lowPerformance = review ? review.rating < 4.2 : false;
    const riskScore =
      (employee.attrition_risk === "high" ? 55 : employee.attrition_risk === "medium" ? 30 : 10) +
      (lowPerformance ? 20 : 0);

    return {
      employee_id: employee.id,
      employee_name: employee.name,
      attrition_risk: employee.attrition_risk,
      risk_score: Math.min(100, riskScore),
      recommendation:
        riskScore >= 70
          ? "Manager check-in, growth plan, and compensation review."
          : "Monitor engagement cadence and stay interviews.",
    };
  });

export const aiService = {
  async getInsights() {
    const context = await aiRepository.getContext();
    const attritionSignals = deriveAttritionSignals(context.employees, context.performance_reviews);

    const salaryBenchmark = context.payroll_logs.reduce((result, payrollLog) => {
      const currentValues = result[payrollLog.employee_id] ?? [];
      currentValues.push(payrollLog.net_pay);
      result[payrollLog.employee_id] = currentValues;
      return result;
    }, {});

    const leaveAnomalies = context.leave_requests
      .filter((leaveRequest) => leaveRequest.days >= 3 || leaveRequest.status === "rejected")
      .map((leaveRequest) => ({
        leave_request_id: leaveRequest.id,
        employee_id: leaveRequest.employee_id,
        anomaly: leaveRequest.days >= 3 ? "extended_absence" : "policy_exception",
      }));

    const topCandidates = [...context.candidates]
      .sort((left, right) => right.score - left.score)
      .slice(0, 3)
      .map((candidate) => ({
        candidate_id: candidate.id,
        name: candidate.name,
        score: candidate.score,
        recommendation: candidate.score >= 90 ? "Fast-track to decision." : "Proceed with structured panel.",
      }));

    return {
      attritionSignals,
      salaryBenchmark: Object.entries(salaryBenchmark).map(([employeeId, salaries]) => ({
        employee_id: employeeId,
        average_net_pay: Number(
          (salaries.reduce((total, value) => total + value, 0) / Math.max(1, salaries.length)).toFixed(2),
        ),
      })),
      leaveAnomalies,
      topCandidates,
      hooks: {
        attritionModel: "placeholder://models/attrition-v1",
        salaryModel: "placeholder://models/salary-benchmark-v1",
        anomalyModel: "placeholder://models/leave-anomaly-v1",
        candidateModel: "placeholder://models/candidate-score-v1",
      },
    };
  },
  async scoreCandidate(payload) {
    const weightedScore =
      payload.years_experience * 6 +
      payload.skill_match * 0.45 +
      payload.culture_fit * 0.35 +
      Math.max(0, 20 - payload.notice_period_days * 0.2);

    return {
      candidate_id: payload.candidate_id ?? null,
      score: Number(Math.min(100, weightedScore).toFixed(1)),
      label: weightedScore >= 85 ? "strong_fit" : weightedScore >= 70 ? "promising" : "needs_review",
    };
  },
};

