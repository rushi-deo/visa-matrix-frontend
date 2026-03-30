import { verifyToken } from "../services/authService.js";
import { buildUserContext, getUserById } from "../services/accessControlService.js";

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

    const payload = verifyToken(token);
    const user = await getUserById(payload.sub);
    req.user = await buildUserContext(user);
    req.tokenPayload = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token.",
      message: error.message,
    });
  }
};
