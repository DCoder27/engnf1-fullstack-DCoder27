import User from "../models/User.js";
import { verifyAccessToken } from "../utils/jwt.js";

const sendError = (res, status, code, message) => {
  return res.status(status).json({
    error: { code, message },
  });
};

export const authenticate = async (req, res, next) => {
  const authorization = req.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return sendError(
      res,
      401,
      "UNAUTHENTICATED",
      "A valid Bearer access token is required",
    );
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return sendError(
      res,
      401,
      "UNAUTHENTICATED",
      "A valid Bearer access token is required",
    );
  }

  let payload;

  try {
    payload = verifyAccessToken(token);
  } catch {
    return sendError(
      res,
      401,
      "UNAUTHENTICATED",
      "The access token is invalid or expired",
    );
  }

  try {
    const user = await User.findById(payload.sub);

    if (!user) {
      return sendError(
        res,
        401,
        "UNAUTHENTICATED",
        "The access token is invalid or expired",
      );
    }

    req.auth = {
      userId: user.id,
      role: user.role,
    };
    req.user = user;

    return next();
  } catch (error) {
    if (error?.name === "CastError") {
      return sendError(
        res,
        401,
        "UNAUTHENTICATED",
        "The access token is invalid or expired",
      );
    }

    return next(error);
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(
        res,
        401,
        "UNAUTHENTICATED",
        "Authentication is required",
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        "FORBIDDEN",
        "You do not have permission to perform this action",
      );
    }

    return next();
  };
};

export const requireAdmin = authorize("ADMIN");
