import { dto, createSchema } from "../../shared/validation/schema.js";
import { CANDIDATE_STAGES } from "../../shared/constants.js";

export const candidateQuerySchema = createSchema({
  stage: dto.string({ optional: true }),
  search: dto.string({ optional: true, allowEmpty: true }),
  sortBy: dto.string({ optional: true }),
  sortOrder: dto.string({ optional: true }),
  page: dto.number({ optional: true, defaultValue: 1, min: 1 }),
  pageSize: dto.number({ optional: true, defaultValue: 10, min: 1 }),
});

export const candidateCreateSchema = createSchema({
  name: dto.string(),
  role: dto.string(),
  stage: dto.enumeration(CANDIDATE_STAGES, { optional: true, defaultValue: "applied" }),
  source: dto.string(),
  owner: dto.string(),
  salary_expectation: dto.number({ min: 0 }),
  score: dto.number({ optional: true, defaultValue: 0, min: 0 }),
});

export const candidateStageSchema = createSchema({
  toStage: dto.enumeration(CANDIDATE_STAGES),
});

