import crypto from "node:crypto";

export function generateVerificationCode(length = 6) {
  const digits = "0123456789";
  let output = "";

  for (let index = 0; index < length; index += 1) {
    output += digits[crypto.randomInt(0, digits.length)];
  }

  return output;
}

export function hashVerificationCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}
