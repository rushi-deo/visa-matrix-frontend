import { createNotFoundError } from "../../shared/errors.js";
import { getHrStore } from "../../shared/repository/hrStore.js";
import { generateId } from "../../shared/repository/hrRepositoryUtils.js";
import { applyQueryOptions } from "../../shared/repository/queryUtils.js";

const table = getHrStore();

export const recruitmentRepository = {
  async listCandidates(query = {}) {
    return applyQueryOptions(table.candidates, {
      filters: { stage: query.stage },
      search: query.search,
      searchFields: ["name", "role", "owner", "source"],
      sortBy: query.sortBy ?? "updated_at",
      sortOrder: query.sortOrder ?? "desc",
      page: query.page,
      pageSize: query.pageSize,
    });
  },
  async createCandidate(payload) {
    const record = {
      id: generateId("cand"),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...payload,
    };

    table.candidates.unshift(record);
    return structuredClone(record);
  },
  async moveCandidateStage(candidateId, toStage) {
    const candidateIndex = table.candidates.findIndex((item) => item.id === candidateId);
    if (candidateIndex === -1) {
      throw createNotFoundError("Candidate");
    }

    const previousStage = table.candidates[candidateIndex].stage;
    table.candidates[candidateIndex] = {
      ...table.candidates[candidateIndex],
      stage: toStage,
      updated_at: new Date().toISOString(),
    };

    return {
      candidate: structuredClone(table.candidates[candidateIndex]),
      previousStage,
    };
  },
};

