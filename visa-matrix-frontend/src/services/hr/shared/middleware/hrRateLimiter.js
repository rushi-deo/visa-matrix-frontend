import { HrModuleError } from "../errors.js";

const requestBuckets = new Map();

export const hrRateLimiter = ({ windowMs = 60_000, max = 120 } = {}) => (req, res, next) => {
  const bucketKey = req.user?.id ?? req.ip ?? "anonymous";
  const now = Date.now();
  const bucket = requestBuckets.get(bucketKey) ?? [];
  const recentRequests = bucket.filter((timestamp) => now - timestamp < windowMs);

  recentRequests.push(now);
  requestBuckets.set(bucketKey, recentRequests);

  if (recentRequests.length > max) {
    next(new HrModuleError("HR API rate limit exceeded.", 429));
    return;
  }

  next();
};

