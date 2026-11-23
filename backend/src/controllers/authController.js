import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { comparePassword, hashPassword } from "../utils/password.js";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;

const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/api/auth",
});

const setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...refreshCookieOptions(),
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
};

const sendError = (res, status, code, message) => {
  return res.status(status).json({
    error: { code, message },
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.exists({ email });

    // Check if an account with this email already exists..
    if (existingUser) {
      return sendError(
        res,
        409,
        "CONFLICT",
        "An account with this email already exists",
      );
    }

    // Hash the password before storing it...
    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "USER",
    });

    return res.status(201).json({ user });
  } catch (error) {
    if (error?.code === 11000) {
      return sendError(
        res,
        409,
        "CONFLICT",
        "An account with this email already exists",
      );
    }

    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+passwordHash");

    // Check if the user exists and if the password is valid...
    const passwordIsValid =
      user && (await comparePassword(password, user.passwordHash));

    // If the user doesn't exist or the password is invalid, return an error response...
    if (!passwordIsValid) {
      return sendError(
        res,
        401,
        "UNAUTHENTICATED",
        "Invalid email or password",
      );
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      token: accessToken,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    // Get the refresh token from the cookies...
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!refreshToken) {
      return sendError(
        res,
        401,
        "UNAUTHENTICATED",
        "Refresh token is required",
      );
    }

    let payload;

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return sendError(
        res,
        401,
        "UNAUTHENTICATED",
        "Refresh token is invalid or expired",
      );
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      return sendError(
        res,
        401,
        "UNAUTHENTICATED",
        "Refresh token is invalid or expired",
      );
    }

    const accessToken = generateAccessToken(user);
    const rotatedRefreshToken = generateRefreshToken(user);

    // Set the new refresh token in the cookie...
    setRefreshCookie(res, rotatedRefreshToken);

    return res.status(200).json({
      token: accessToken,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions());
  return res.status(204).send();
};

export const getCurrentUser = (req, res) => {
  return res.status(200).json({ user: req.user });
};
