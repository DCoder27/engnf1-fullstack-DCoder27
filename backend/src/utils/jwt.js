import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "24h";
const TOKEN_ISSUER = "triagesync";

const requireSecret = (name) => {
  const secret = process.env[name];

  if (!secret) {
    throw new Error(`${name} is not configured`);
  }

  return secret;
};

const getUserId = (user) => {
  const userId = user.id ?? user._id;

  if (!userId) {
    throw new Error("User ID is required to generate a token");
  }

  return userId.toString();
};

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      type: "access",
      role: user.role,
    },
    requireSecret("JWT_ACCESS_SECRET"),
    {
      subject: getUserId(user),
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: TOKEN_ISSUER,
      audience: "triagesync-api",
    },
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      type: "refresh",
    },
    requireSecret("JWT_REFRESH_SECRET"),
    {
      subject: getUserId(user),
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: TOKEN_ISSUER,
      audience: "triagesync-refresh",
    },
  );
};

export const verifyAccessToken = (token) => {
  const payload = jwt.verify(
    token,
    requireSecret("JWT_ACCESS_SECRET"),
    {
      issuer: TOKEN_ISSUER,
      audience: "triagesync-api",
    },
  );

  if (payload.type !== "access") {
    throw new Error("Invalid access token");
  }

  return payload;
};

export const verifyRefreshToken = (token) => {
  const payload = jwt.verify(
    token,
    requireSecret("JWT_REFRESH_SECRET"),
    {
      issuer: TOKEN_ISSUER,
      audience: "triagesync-refresh",
    },
  );

  if (payload.type !== "refresh") {
    throw new Error("Invalid refresh token");
  }

  return payload;
};