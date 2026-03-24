import crypto from "node:crypto";

export function generatePasswordResetToken() {
  return crypto.randomBytes(24).toString("base64url");
}

export function hashPasswordResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
