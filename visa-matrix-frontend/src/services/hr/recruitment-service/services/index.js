import { getHrStore } from "../../shared/repository/hrStore.js";
import { emitCandidateMovedStage } from "../events/index.js";
import { recruitmentRepository } from "../repository/index.js";

const table = getHrStore();

export const recruitmentService = {
  async listCandidates(query) {
    return recruitmentRepository.listCandidates(query);
  },
  async createCandidate(payload) {
    return recruitmentRepository.createCandidate(payload);
  },
  async moveCandidateStage(candidateId, toStage, actorId) {
    const { candidate, previousStage } = await recruitmentRepository.moveCandidateStage(candidateId, toStage);
    await emitCandidateMovedStage({
      actorId,
      organization_id: null,
      referenceId: candidate.id,
      candidate,
      fromStage: previousStage,
      toStage,
    });

    return candidate;
  },
  async getHiringFunnel() {
    const funnel = table.candidates.reduce((result, candidate) => {
      result[candidate.stage] = (result[candidate.stage] ?? 0) + 1;
      return result;
    }, {});

    return {
      funnel,
      total: table.candidates.length,
    };
  },
};

