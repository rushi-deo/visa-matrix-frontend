import { dto, createSchema } from "../../shared/validation/schema.js";

export const notificationQuerySchema = createSchema({
  user_id: dto.string({ optional: true }),
  type: dto.string({ optional: true }),
  search: dto.string({ optional: true, allowEmpty: true }),
  sortBy: dto.string({ optional: true }),
  sortOrder: dto.string({ optional: true }),
  page: dto.number({ optional: true, defaultValue: 1, min: 1 }),
  pageSize: dto.number({ optional: true, defaultValue: 10, min: 1 }),
});

export const notificationCreateSchema = createSchema({
  user_id: dto.string({ optional: true }),
  type: dto.string(),
  message: dto.string(),
  reference_id: dto.string({ optional: true }),
});

