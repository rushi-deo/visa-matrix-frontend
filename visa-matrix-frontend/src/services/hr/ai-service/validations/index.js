import { dto, createSchema } from "../../shared/validation/schema.js";

export const candidateScoreSchema = createSchema({
  candidate_id: dto.string({ optional: true }),
  years_experience: dto.number({ min: 0 }),
  skill_match: dto.number({ min: 0 }),
  culture_fit: dto.number({ min: 0 }),
  notice_period_days: dto.number({ min: 0 }),
});

