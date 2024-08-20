import jwt from "jsonwebtoken";

export const signToken = (email: string) => {
  return jwt.sign({ email }, process.env.JWT_SECRET as string, {
    audience: ["lfgapp"],
    subject: "lfgappaut",
    issuer: "lfgapp",
  });
};
