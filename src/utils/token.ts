import jwt from "jsonwebtoken";

export const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    audience: ["bolhaapp"],
    subject: "bolhaappaut",
    issuer: "bolhaapp",
    expiresIn: "30 days",
  });
};
