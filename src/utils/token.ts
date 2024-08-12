import jwt from "jsonwebtoken";

import type { TokenUser } from "@/types/user";

type VerifiedToken = (jwt.JwtPayload & { user: TokenUser }) | null;

const options = { audience: "lfgapp", subject: "lfgaut", issuer: "lfg" };

export const signToken = (user: TokenUser, type: "access" | "refresh") => {
  return jwt.sign({ user }, process.env.JWT_SECRET as string, {
    expiresIn: type === "access" ? "7m" : "12h",
    ...options,
  });
};

export const setupTokens = (user: TokenUser) => {
  const accessToken = signToken(user, "access");
  const refreshToken = signToken(user, "refresh");

  return { accessToken, refreshToken };
};
