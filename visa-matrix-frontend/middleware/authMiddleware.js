import { verifyToken } from "../services/authService.js";
import { supabase } from "../config/supabaseClient.js";
import { buildUserContext, getUserByEmail, getUserById, seededUsers } from "../services/accessControlService.js";

const DEFAULT_ORGANIZATION_ID = "ORG-INTERNAL";

const resolveSupabaseUser = async (token) => {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return null;
  }

  const authUser = data.user;
  const metadata = authUser.user_metadata ?? {};
  const matchedUser =
    seededUsers.find((user) => user.id === authUser.id || user.email === authUser.email) ??
    (authUser.email ? await getUserByEmail(authUser.email).catch(() => null) : null);

  return buildUserContext({
    id: authUser.id ?? matchedUser?.id ?? authUser.email ?? "supabase-user",
    name:
      metadata.full_name ??
      metadata.name ??
      matchedUser?.name ??
      authUser.email?.split("@")[0] ??
      "Visa Matrix User",
    email: authUser.email ?? matchedUser?.email ?? "",
    role: metadata.role ?? matchedUser?.role ?? "agent",
    organization_id:
      metadata.organization_id ?? matchedUser?.organization_id ?? DEFAULT_ORGANIZATION_ID,
    organization_name:
      metadata.organization_name ?? matchedUser?.organization_name ?? "Visa Matrix",
    is_external: metadata.is_external ?? matchedUser?.is_external ?? false,
  });
};

export const authMiddleware = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication required.",
      });
    }

    try {
      const payload = verifyToken(token);
      const user = await getUserById(payload.sub);
      req.user = await buildUserContext(user);
      req.tokenPayload = payload;
      next();
      return;
    } catch (tokenError) {
      const supabaseUser = await resolveSupabaseUser(token);

      if (!supabaseUser) {
        throw tokenError;
      }

      req.user = supabaseUser;
      req.tokenPayload = {
        sub: supabaseUser.id,
        role: supabaseUser.role,
        organization_id: supabaseUser.organization_id,
        source: "supabase",
      };
      next();
      return;
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token.",
      message: error.message,
    });
  }
};
